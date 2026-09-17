# Rapports de performance (k6, Lighthouse)

Preuves versionnées pour l'analyse de performance (bloc 4) — lecture et interprétation
dans [`docs/analyse-performance.md`](../../analyse-performance.md). Un fichier par run,
préfixé par la date de la campagne.

| Fichier | Contenu |
| --- | --- |
| `<date>-k6-<run>.json` | résumé k6 tel quel (`--summary-export`) : compteurs, percentiles par endpoint, verdict de chaque seuil (`thresholds.<seuil>: false` = tenu, `true` = dépassé) |
| `<date>-k6-<run>.txt` | sortie terminal de k6 réduite à l'en-tête (script, scénario) et au bloc final (`THRESHOLDS` + `TOTAL RESULTS`) — les barres de progression sont retirées |
| `<date>-lighthouse.json` | version compactée des rapports Lighthouse : score, Web Vitals (FCP, LCP, TBT, CLS, SI, TTI), throttling, quelques diagnostics. Les rapports HTML complets (~450 Ko chacun) sont conservés hors dépôt, en annexe du dossier |

## Campagne du 16 septembre 2026

- **Code** : `develop` à `854707c`.
- **Machine** : AMD Ryzen 7 7735HS · 15,2 Go RAM · Windows 11 Famille (build 26200), Docker Desktop.
- **Cible k6** : back lancé **en natif** (`node dist/main` par service, `env/.env.dev`), infra
  (PostgreSQL, RabbitMQ, Redis) dans Docker ; k6 dans le conteneur `grafana/k6` avec
  `BASE_URL=http://host.docker.internal:3001`. Ce n'est pas le montage par défaut de
  `load/README.md` (gateway conteneurisée sur `goosee_net`) : les chiffres ne sont
  comparables qu'entre runs de cette campagne, ou avec un montage identique.
- **Script** : `load/gateway-lecture.js`. Les runs `palier-*` et `rupture` ont été faits avec
  deux copies ad hoc de ce script (`palier.js`, `rupture.js`, visibles dans l'en-tête des
  `.txt`) qui ne différaient que par les `stages` et un seuil supplémentaire sur
  `GET /products/:id`. Ces deux variantes ont depuis été intégrées à `load/profils.js`
  (`SCENARIO=rupture`, `SCENARIO=palier VUS=<n>`) et le seuil ajouté au script : la
  commande de reproduction est celle indiquée ci-dessous.

| Run | Commande (bash, stack dev up) | Charge | Seuils |
| --- | --- | --- | --- |
| `k6-smoke-lecture` | `K6_BASE_URL=http://host.docker.internal:3001 yarn load:gateway` | 5 VUs, 1 min 10 | ✓ 3/3 |
| `k6-load-lecture` | `SCENARIO=load K6_BASE_URL=… yarn load:gateway` | 50 VUs, 7 min 30 | ✓ 3/3 |
| `k6-palier-100` | `SCENARIO=palier VUS=100 K6_BASE_URL=… yarn load:gateway` | 100 VUs tenus 45 s | ✓ 4/4 |
| `k6-palier-250` | `SCENARIO=palier VUS=250 …` | 250 VUs tenus 45 s | ✓ 4/4 |
| `k6-palier-500` | `SCENARIO=palier VUS=500 …` | 500 VUs tenus 45 s | ✗ 1/4 (3 seuils de latence dépassés) |
| `k6-palier-1000` | `SCENARIO=palier VUS=1000 …` | 1 000 VUs tenus 45 s | ✗ 1/4 + 13 `GET /health` en échec (0,03 %) |
| `k6-rupture` | `SCENARIO=rupture K6_BASE_URL=… yarn load:gateway` | 100 → 250 → 500 → 1 000 VUs enchaînés, 6 min 20 | ✗ 1/4 |

Les runs smoke et load ont été faits avec le script d'origine (3 seuils, pas encore de
seuil sur `GET /products/:id`), d'où « 3/3 » ; la métrique de cet endpoint y est tout de
même mesurée.

### Lighthouse (front, `templates/front`)

- **Cible** : front Next.js en build de production (`next build && next start`) sur
  `http://localhost:3000`, même back que ci-dessus, catalogue de démonstration.
- **Outil** : Lighthouse 12.8.2 (CLI, Chrome headless 153), catégorie *performance*
  uniquement, throttling simulé par défaut (mobile : Moto G Power émulé, 4G lente,
  CPU ×4 ; desktop : preset `desktop`).
- **Pages** : accueil `/fr`, catalogue `/fr/catalogue`, fiche produit `/fr/produits/:id`.
- **Reproduction** :

```bash
npx lighthouse http://localhost:3000/fr --only-categories=performance --preset=desktop \
  --output=json --output-path=./perf-accueil.json
npx lighthouse http://localhost:3000/fr --only-categories=performance \
  --output=json --output-path=./mobile-accueil.json      # mobile = défaut
```
