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
| `load` | paliers jusqu'à 50 VUs | ~7 min | comportement sous charge |

## 3. Lancer

Stack de développement démarrée (`yarn infra` + `docker-compose.back.dev.yml`), puis
`yarn init:user` :

```bash
yarn load:gateway                       # profil smoke
# profil load — PowerShell
$env:SCENARIO="load"; yarn load:gateway
# profil load — bash
SCENARIO=load yarn load:navigation
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
| `GET /products` | p95 < 500 ms (lecture) · < 400 ms (navigation) |
| `GET /products/:id` | p95 < 400 ms (navigation) ; aucun seuil dédié en lecture |
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

## 6. Validation locale du 17 septembre 2026

Le profil `poc` a été exécuté successivement sur Docker et k3s : lecture et navigation
avec panier, 695 requêtes au total, aucune erreur HTTP et tous les seuils respectés.
Les p95 globaux vont de 10,96 à 13,72 ms. k6 était plafonné à 0,5 CPU et 256 Mio.
Cette passe vérifie une faible charge ; elle ne mesure ni la saturation ni l'autoscaling.
Les résultats et commandes sont dans [validation-poc-tests.md](validation-poc-tests.md).
