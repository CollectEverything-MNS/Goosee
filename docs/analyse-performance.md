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
| `parcours-navigation.js` | `POST /auth/login` → `GET /products` → `GET /products/:id` → `POST /cart/:key/items` → `GET /cart/:key` |

`parcours-navigation.js` prépare le catalogue une fois (`setup()` : connexion OWNER puis
création d'une catégorie et de produits si le catalogue est trop petit).

## 2. Profils de charge

Définis dans `load/profils.js`, choisis avec `-e SCENARIO=` :

| Profil | Charge | Durée | Usage |
| --- | --- | --- | --- |
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
| `GET /products`, `GET /products/:id` | p95 < 500 ms (lecture) · < 400 ms (navigation) |
| `GET /health` | p95 < 200 ms |
| `POST /cart/items` | p95 < 600 ms |
| `POST /auth/login` | p95 < 1500 ms (hachage bcrypt, volontairement large) |

### Corrélation avec les métriques serveur

Pendant un run, les métriques RED de la gateway (`http_requests_total`,
`http_request_duration_seconds`, cf. bloc métriques Prometheus) évoluent en parallèle et
permettent de recouper la vue client (k6) et la vue serveur. Sortie k6 vers Prometheus :
voir `load/README.md`.

## 5. Résultats

À remplir après un run réel.

| Scénario | Profil | Date / commit | p95 | p99 | Débit (req/s) | Erreurs | Seuils |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `gateway-lecture` | smoke | | | | | | |
| `gateway-lecture` | load | | | | | | |
| `parcours-navigation` | smoke | | | | | | |
| `parcours-navigation` | load | | | | | | |

**Machine de test** : `__________` (CPU, RAM, OS) — les valeurs absolues en dépendent.

**Observations** : `__________`
