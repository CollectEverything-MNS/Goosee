# Tests de charge — k6

Deux scripts [k6](https://k6.io/) qui sollicitent l'API Gateway sous montée en charge et
mesurent débit, latence (p95/p99) et taux d'erreur.

| Script | Ce qu'il exerce |
| --- | --- |
| `gateway-lecture.js` | `GET /health`, `GET /products`, `GET /products/:id` — lecture pure, sans auth ni écriture |
| `parcours-navigation.js` | `GET /products` → `GET /products/:id` → `POST /cart/:key/items` → `GET /cart/:key` (client anonyme ; `setup()` se connecte une fois en OWNER pour semer le catalogue) |

`profils.js` définit les paliers de charge, communs aux deux scripts.

## Prérequis

**Docker uniquement.** k6 n'est pas installé : il tourne dans le conteneur
`grafana/k6` (image tirée une fois, ~45 Mo). Le service est décrit dans
`docker/dev/docker-compose.load.dev.yml` (profil `load` : jamais démarré avec la stack).

La **stack dev doit tourner** — le conteneur k6 rejoint le réseau `goosee_net` et joint
la gateway par son nom :

```bash
yarn infra
docker compose --env-file env/.env.dev \
  -f docker/dev/docker-compose.infra.dev.yml \
  -f docker/dev/docker-compose.back.dev.yml up -d --build
yarn init:user            # OWNER, requis par parcours-navigation.js
```

## Lancer

```bash
yarn load:gateway         # profil smoke (défaut) : ~1 min, 5 VUs
yarn load:navigation
```

### Choisir le profil

`poc` limite le scénario à deux utilisateurs simultanés sur 30 secondes.
Pour les tenants de démonstration et un conteneur k6 plafonné à 0,5 CPU / 256 Mio,
voir les [commandes et résultats de validation](../docs/validation-poc-tests.md).

`smoke` (défaut) valide juste que le script et la cible répondent. `load` monte
jusqu'à 50 VUs sur ~7 min. `rupture` enchaîne 100 → 250 → 500 → 1 000 VUs (~6 min 20)
pour trouver le palier où les seuils cassent ; `palier` tient un seul niveau 45 s,
donné par `VUS`.

```bash
# PowerShell
$env:SCENARIO="load"; yarn load:gateway
$env:SCENARIO="palier"; $env:VUS="500"; yarn load:gateway
# bash
SCENARIO=load yarn load:gateway
SCENARIO=rupture yarn load:gateway
SCENARIO=palier VUS=500 yarn load:gateway
```

### Garder une preuve du run

`docs/performance/rapports/` est monté dans le conteneur sur `/rapports`. Les options
ajoutées après `yarn load:…` sont passées à k6 :

```bash
SCENARIO=palier VUS=500 yarn load:gateway --summary-export /rapports/$(date +%F)-k6-palier-500.json
```

Le JSON produit (résumé de fin de run : compteurs, percentiles, verdict des seuils) est
à versionner avec la sortie terminal et une entrée dans le README du dossier. Résultats
commentés : `docs/analyse-performance.md`.

### Autres réglages (variables d'environnement, toutes optionnelles)

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `SCENARIO` | `smoke` | `poc`, `smoke`, `load`, `rupture` ou `palier` |
| `VUS` | _(vide)_ | nombre de VUs du profil `palier` (obligatoire avec ce profil) |
| `K6_BASE_URL` | `http://goosee-api-gateway-dev:3001` | cible ; ex. `http://host.docker.internal:3001` hors réseau `goosee_net` |
| `K6_OWNER_EMAIL` / `K6_OWNER_PASSWORD` | `admin@goosee.dev` / `goosee` | identifiants OWNER (`parcours-navigation.js`) |
| `K6_PROMETHEUS_RW_SERVER_URL` | _(vide)_ | active la sortie Prometheus (voir plus bas) |

## Lire les résultats

### Par défaut : résumé dans le terminal

k6 affiche en fin de run les métriques et le verdict des seuils :

```
     http_req_duration..............: avg=42ms  p(90)=78ms  p(95)=110ms  p(99)=180ms
     http_req_failed................: 0.00%   ✓ 0        ✗ 4213
     http_reqs.....................: 4213    70.2/s
   ✓ http_req_duration{name:GET /products}...: p(95)<500
   ✓ http_req_failed.........................: rate<0.01
```

Un seuil dépassé passe en `✗` et k6 **sort en code 99**. Les valeurs par script :

| Métrique | Seuil |
| --- | --- |
| `http_req_failed` | < 1 % (lecture) · < 2 % (navigation) |
| `GET /products`, `GET /products/:id` | p95 < 500 ms (lecture) · < 400 ms (navigation) |
| `GET /health` | p95 < 200 ms |
| `POST /cart/items` | p95 < 600 ms |

Ordres de grandeur mesurés (`docs/analyse-performance.md`) : seuils tenus jusqu'à 250 VUs
sur le parcours de lecture, rupture entre 250 et 500 VUs (plafond ~535 req/s sur la
machine de test, back en natif).

### Optionnel : vers Prometheus (puis Grafana)

1. Démarrer l'observabilité : `yarn observability` (Prometheus sur `:9090`). Le
   `docker-compose.observability.yml` inclut `--web.enable-remote-write-receiver`,
   nécessaire pour recevoir les métriques k6.
2. Lancer k6 avec la sortie `experimental-prometheus-rw` :

```bash
K6_PROMETHEUS_RW_SERVER_URL=http://host.docker.internal:9090/api/v1/write \
  docker compose -f docker/dev/docker-compose.load.dev.yml run --rm k6 \
  run -o experimental-prometheus-rw /scripts/gateway-lecture.js
```

3. Les métriques `k6_http_req_duration`, `k6_http_reqs`, `k6_vus`… sont alors dans
   Prometheus, requêtables dans son UI (`http://localhost:9090`, onglet Graph).
4. **Quand Grafana sera ajouté au projet** : brancher la datasource Prometheus et
   importer le dashboard k6 officiel — [ID `19665`](https://grafana.com/grafana/dashboards/19665).
   Sans Grafana, les données restent consultables brutes dans Prometheus.

## Pas de CI

Comme la suite e2e : une vraie charge demande la stack complète et plusieurs minutes,
et les chiffres dépendent de la machine. Lancement manuel uniquement.
