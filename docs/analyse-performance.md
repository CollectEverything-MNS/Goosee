# Analyse de performance — test de charge

> Objectif : **vérifier que l'API Gateway tient une montée en charge** sur ses chemins
> les plus sollicités, et disposer d'une mesure reproductible. Ce document n'a pas pour
> but d'optimiser le code.

## 1. Outil et méthode

[k6](https://k6.io/) (Grafana Labs), exécuté via l'image Docker `grafana/k6` — **aucune
installation** : voir [`load/README.md`](../load/README.md). k6 rejoue un parcours
JavaScript avec un nombre croissant d'utilisateurs virtuels (VUs) et mesure lui-même la
latence, le débit et le taux d'erreur.

Deux scénarios, dans `load/` :

| Script | Chemin exercé |
| --- | --- |
| `gateway-lecture.js` | `GET /health`, `GET /products`, `GET /products/:id` — lecture pure, sans authentification ni écriture |
| `parcours-navigation.js` | `GET /products` → `GET /products/:id` → `POST /cart/:key/items` → `GET /cart/:key` (client anonyme, panier par clé de session) |

`parcours-navigation.js` prépare le catalogue une fois (`setup()` : connexion OWNER puis
création d'une catégorie et de produits si le catalogue est trop petit). Le parcours
lui-même ne se connecte pas : `POST /auth/login` est limité à 5 requêtes/min
(anti-force-brute) et n'a pas sa place dans un scénario de charge.

## 2. Profils de charge

Définis dans `load/profils.js`, choisis avec `-e SCENARIO=` :

| Profil | Charge | Durée | Usage |
| --- | --- | --- | --- |
| `poc` | jusqu’à 2 VUs | 30 s | vérification locale à faible consommation |
| `smoke` (défaut) | jusqu'à 5 VUs | ~1 min | valider que le script et la cible répondent |
| `load` | paliers jusqu'à 50 VUs | ~7 min | comportement sous charge attendue |
| `rupture` | 100 → 250 → 500 → 1 000 VUs enchaînés | ~6 min 20 | trouver le palier où les seuils cassent |
| `palier` | un seul palier, `VUS=<n>` tenu 45 s | ~1 min | mesurer un niveau de charge isolément (résumé k6 propre à ce niveau) |

## 3. Lancer

Stack de développement démarrée (`yarn infra` + `docker-compose.back.dev.yml`), puis
`yarn init:user` :

```bash
yarn load:gateway                       # profil smoke
# profil load — PowerShell
$env:SCENARIO="load"; yarn load:gateway
# profil load — bash
SCENARIO=load yarn load:navigation
# recherche du point de rupture, puis un palier isolé
SCENARIO=rupture yarn load:gateway
SCENARIO=palier VUS=500 yarn load:gateway
```

Pour garder une preuve du run : `docs/performance/rapports/` est monté dans le conteneur
sur `/rapports`, il suffit d'ajouter l'option k6 à la commande.

```bash
SCENARIO=palier VUS=500 yarn load:gateway --summary-export /rapports/$(date +%F)-k6-palier-500.json
```

## 4. Métriques observées

k6 affiche un résumé en fin de run. On regarde :

| Métrique | Ce que c'est |
| --- | --- |
| `http_req_duration` p95 / p99 | latence : 95 % / 99 % des requêtes servies sous cette valeur |
| `http_reqs` (`…/s`) | débit soutenu (requêtes par seconde) |
| `http_req_failed` | taux de requêtes en erreur |
| `vus` / `iterations` | charge appliquée et parcours complets réalisés |

### Seuils déclarés (`thresholds`)

Un seuil dépassé fait sortir k6 en code non nul.

| Métrique | Seuil |
| --- | --- |
| `http_req_failed` | < 1 % (lecture) · < 2 % (navigation) |
| `GET /products`, `GET /products/:id` | p95 < 500 ms (lecture) · < 400 ms (navigation) |
| `GET /health` | p95 < 200 ms |
| `POST /cart/items` | p95 < 600 ms |

### Corrélation avec les métriques serveur

Pendant un run, les métriques RED de la gateway (`http_requests_total`,
`http_request_duration_seconds`, cf. bloc métriques Prometheus) évoluent en parallèle et
permettent de recouper la vue client (k6) et la vue serveur. Sortie k6 vers Prometheus :
voir `load/README.md`.

## 5. Résultats historiques du 8 septembre 2026

Runs du 2026-09-08 (base `36e285c`). Latences en millisecondes, par endpoint (`p95` / `p99`).

| Scénario | Profil | VUs max | Requêtes | Débit (req/s) | Erreurs | Seuils |
| --- | --- | --- | --- | --- | --- | --- |
| `gateway-lecture` | smoke | 5 | 805 | 11,5 | 0,00 % | ✓ 3/3 |
| `gateway-lecture` | load | 50 | 41 926 | 93,1 | 0,00 % | ✓ 3/3 |
| `parcours-navigation` | smoke | 5 | 1 050 | 14,8 | 0,00 % | ✓ 4/4 |
| `parcours-navigation` | load | 50 | 54 874 | 121,7 | 0,00 % | ✓ 4/4 |

### Latence par endpoint (p95 / p99, ms)

| Endpoint | lecture smoke | lecture load | navigation smoke | navigation load |
| --- | --- | --- | --- | --- |
| `GET /health` | 2,7 / 2,9 | 2,9 / 3,9 | — | — |
| `GET /products` | 8,9 / 10,6 | 10,0 / 13,2 | 10,2 / 11,9 | 11,1 / 15,1 |
| `GET /products/:id` | — | — | 9,2 / 12,2 | 11,0 / 15,5 |
| `POST /cart/:key/items` | — | — | 18,9 / 22,3 | 19,1 / 26,7 |

**Machine de test** : AMD Ryzen 7 7735HS · 15,2 Go RAM · Windows 11 Famille (build 26200),
Docker Desktop — back lancé en natif (`yarn dev`), k6 dans un conteneur pointant sur
`host.docker.internal:3001`.

**Observations** : aucun échec sur les quatre runs, tous les seuils tenus. Le passage de
5 à 50 VUs multiplie le débit par ~8 (lecture) et ~8 (navigation) tout en gardant la
latence quasi stable (p95 `/products` 8,9 → 10,0 ms ; p99 10,6 → 13,2 ms) : pas de
saturation à cette charge. `POST /cart/:key/items` (seule écriture) reste le plus lent,
sans dérive notable sous charge. `POST /auth/login` n'est pas mesuré : il est limité à
5 requêtes/min (anti-force-brute) et le parcours de navigation est anonyme.

## 6. Résultats — campagne du 2026-09-16 (point de rupture)

Objectif : la campagne du 8 septembre s'arrête à 50 VUs, tous seuils tenus, donc ne
montre aucune limite. Celle-ci pousse le parcours de lecture (`gateway-lecture.js`)
jusqu'à 1 000 VUs pour situer le **point de rupture** : le palier à partir duquel les
seuils du §4 ne sont plus tenus.

Base `854707c`. Preuves (résumés k6 JSON + sortie terminal) dans
[`docs/performance/rapports/`](performance/rapports/README.md). **Montage différent
du 8 septembre** : back lancé en natif (`node dist/main`), infra dans Docker, k6 dans
un conteneur visant `host.docker.internal:3001` — même machine que ci-dessus. k6 et le
back partagent donc le CPU : à 500 et 1 000 VUs, le générateur de charge pèse lui-même
sur la machine, et le point de rupture mesuré est une **borne basse**.

### Paliers isolés (`SCENARIO=palier`, 45 s tenus par palier)

| VUs | Requêtes | Débit (req/s) | `GET /health` p95 / p99 | `GET /products` p95 / p99 | `GET /products/:id` p95 / p99 | Erreurs | Seuils |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 5 (smoke) | 793 | 11,3 | 4,8 / 13,1 | 17,4 / 31,2 | — | 0,00 % | ✓ 3/3 |
| 50 (load, 7 min 30) | 41 590 | 92,2 | 5,8 / 12,5 | 18,8 / 32,5 | — | 0,00 % | ✓ 3/3 |
| 100 | 16 194 | 246,5 | 6,2 / 11,4 | 20,7 / 32,5 | 19,9 / 31,7 | 0,00 % | ✓ 4/4 |
| 250 | 33 558 | 510,2 | 100,2 / 130,8 | 211,7 / 319,3 | 211,4 / 310,9 | 0,00 % | ✓ 4/4 |
| **500** | 35 298 | 535,4 | **407,6** / 441,0 | **830,6** / 968,7 | **818,5** / 886,6 | 0,00 % | ✗ 1/4 |
| 1 000 | 35 655 | 536,8 | 978,4 / 1 935,5 | 1 902,0 / 3 161,6 | 1 875,7 / 2 680,8 | 0,03 % (13 × `/health`) | ✗ 1/4 |

Latences en ms. Les lignes 5 et 50 VUs viennent des runs smoke/load refaits le même jour
avec le script d'origine (sans seuil sur `GET /products/:id`), d'où « 3/3 ».

### Montée enchaînée (`SCENARIO=rupture`, 6 min 20)

184 722 requêtes, 484,9 req/s en moyenne, **0 erreur**, seuils ✗ 1/4 (p95 agrégés :
`/health` 893,5 ms, `/products` 1 797 ms, `/products/:id` 1 790 ms — tirés vers le haut par
le palier à 1 000 VUs). Ce run confirme les paliers isolés dans un même processus, sans
remise à zéro entre niveaux.

### Lecture

- **Jusqu'à 100 VUs : régime linéaire.** Le débit suit la charge (11 → 92 → 247 req/s) et
  la latence ne bouge pas (p95 `/products` 17 → 19 → 21 ms) : pas de file d'attente.
- **250 VUs : début de saturation, seuils encore tenus.** Le débit ne suit plus que
  partiellement (×2,5 de VUs pour ×2,1 de débit) et la latence est ×10 (p95 212 ms),
  signe que les requêtes commencent à attendre.
- **500 VUs : point de rupture.** Le débit plafonne à ~535 req/s (+5 % pour ×2 de VUs)
  et la latence est ×4 (p95 831 ms) : toute charge supplémentaire ne fait qu'allonger la
  file. Les trois seuils de latence sont dépassés, `/health` compris (407 ms pour un
  endpoint sans I/O : c'est la gateway elle-même qui sature, pas la base ou les services).
- **1 000 VUs : même plafond (537 req/s), latence ×2 encore (p95 1,9 s) et premières
  erreurs** (13 `GET /health` sur 35 655, 0,03 % — sous le seuil de 1 %).
- La durée d'une itération (3 requêtes + `sleep(1)`) passe de 1,05 s (p95, 100 VUs) à
  1,52 s (250), 2,95 s (500) et 5,57 s (1 000).

**Conclusion.** Sur cette machine et ce montage, la gateway sert au plus **~535 req/s**
sur le parcours de lecture, soit ~180 parcours complets par seconde. Les seuils sont
tenus **jusqu'à 250 VUs** et cassent **entre 250 et 500 VUs**. La dégradation est
progressive et en latence, pas en erreurs : le service ne tombe pas, il ralentit. La
charge attendue (§5, 50 VUs) est cinq fois sous ce point de rupture. Pour aller plus
loin il faudrait un générateur de charge sur une autre machine (pour lever le biais
k6/back), puis plusieurs réplicas de la gateway (HPA, voir `k8s/`) — hors périmètre de
cette analyse.

## 7. Performance du front (Lighthouse)

Complément côté navigateur : Lighthouse 12.8.2 (CLI, catégorie *performance*), front
Next.js (`templates/front`) en build de production sur `http://localhost:3000`, même
back que le §6. Trois pages publiques ; throttling simulé par défaut (mobile : Moto G
Power émulé, réseau 4G lent, CPU ×4 ; desktop : preset `desktop`). Métriques compactées
dans `docs/performance/rapports/2026-09-16-lighthouse.json` ; rapports HTML en annexe du
dossier.

| Page | Desktop — score | FCP | LCP | TBT | CLS | Mobile — score | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Accueil `/fr` | **98** | 0,4 s | 1,1 s | 10 ms | 0,001 | **81** | 0,9 s | 3,8 s | 340 ms | 0 |
| Catalogue `/fr/catalogue` | **99** | 0,3 s | 0,9 s | 0 ms | 0,001 | **77** | 0,9 s | 4,1 s | 390 ms | 0 |
| Produit `/fr/produits/:id` | **98** | 0,3 s | 1,1 s | 0 ms | 0,001 | **76** | 0,9 s | 3,9 s | 490 ms | 0 |

**Lecture.** Sur desktop les trois pages sont dans le vert (LCP ≈ 1 s, TBT nul, CLS nul).
Sur mobile émulé, le score tombe à 76–81 à cause de deux métriques : le **LCP à 3,8–4,1 s**
(seuil « bon » : 2,5 s) et le **TBT à 340–490 ms** (seuil : 200 ms). Le serveur n'est pas
en cause (`server-response-time` 30–60 ms, poids total 320–460 Ko) : c'est le JavaScript
exécuté au chargement, pénalisé par le CPU ×4 de l'émulation. La mise en page est stable
(CLS 0). Pistes relevées par Lighthouse, non traitées ici : ressources bloquant le rendu
(50–150 ms estimés) et ~23 Ko de JavaScript inutilisé.

## 8. Validation locale du 17 septembre 2026

Le profil `poc` a été exécuté successivement sur Docker et k3s : lecture et navigation
avec panier, 695 requêtes au total, aucune erreur HTTP et tous les seuils respectés.
Les p95 globaux vont de 10,96 à 13,72 ms. k6 était plafonné à 0,5 CPU et 256 Mio.
Cette passe vérifie une faible charge ; elle ne mesure ni la saturation ni l'autoscaling.
Les résultats et commandes sont dans [validation-poc-tests.md](validation-poc-tests.md).
