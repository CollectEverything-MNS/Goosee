# Observabilité — Prometheus + Alertmanager

Pile de supervision centrale de la plateforme. Démarrage :

```bash
yarn observability          # up -d (Prometheus + Alertmanager)
yarn observability:down
```

- Prometheus : http://localhost:9090 (`/alerts` pour l'état des règles)
- Alertmanager : http://localhost:9093

Le réseau `goosee_platform` doit exister au préalable (créé par Traefik).

## Fichiers

| Fichier | Rôle |
|---|---|
| `prometheus.yml` | scrape (self + gateways des tenants via file_sd), `rule_files`, cible Alertmanager |
| `rules/alerts.yml` | règles d'alerte (erreurs, latence, disponibilité, saturation) |
| `alertmanager.yml` | routage + notification Discord |
| `targets/*.json` | cibles par tenant, générées par l'orchestrateur (non versionnées) |
| `alertmanager/secrets/discord_webhook_url` | URL du webhook Discord (non versionnée) |

## Notification Discord

Alertmanager ne gère pas Discord nativement, mais Discord accepte le format de
payload **Slack** sur l'URL `<webhook>/slack`. La conf réutilise donc
`slack_configs`.

Mise en place :

1. Dans Discord : *Paramètres du salon → Intégrations → Webhooks → Nouveau webhook*, copier l'URL.
2. Créer le fichier secret en **ajoutant `/slack`** à la fin de l'URL :

   ```bash
   cp docker/observability/alertmanager/secrets/discord_webhook_url.example \
      docker/observability/alertmanager/secrets/discord_webhook_url
   # puis éditer le fichier avec l'URL réelle + suffixe /slack
   ```

3. `yarn observability` (ou `docker restart goosee-alertmanager` si déjà lancé).

Sans ce fichier, le conteneur `goosee-alertmanager` ne démarre pas (comme pour
les clés Stripe manquantes côté paiement).

Test rapide de bout en bout :

```bash
curl -XPOST http://localhost:9093/api/v2/alerts -H 'Content-Type: application/json' -d '[
  {"labels":{"alertname":"TestDiscord","severity":"warning","job":"manuel"},
   "annotations":{"description":"Ceci est un test de routage Alertmanager -> Discord."}}
]'
```

## Règles d'alerte

| Alerte | Condition | Pour | Sévérité |
|---|---|---|---|
| `GatewayHighErrorRate` | ratio 5xx / total > 5 % | 5 min | critical |
| `GatewayHighLatencyP95` | p95 `http_request_duration_seconds` > 1 s | 10 min | warning |
| `TargetDown` | `up == 0` | 2 min | critical |
| `NodeEventLoopLagHigh` | `nodejs_eventloop_lag_seconds` > 100 ms | 5 min | warning |
| `NodeHeapUsageHigh` | tas V8 utilisé > 90 % | 10 min | warning |
| `ProcessCpuHigh` | `rate(process_cpu_seconds_total[5m])` > 0,85 | 10 min | warning |

Les métriques `http_*` viennent de l'intercepteur RED de l'API Gateway
(`src/metrics/`), les métriques `nodejs_*` / `process_*` de
`collectDefaultMetrics()` de `prom-client`.

Après modification de `rules/alerts.yml` ou `prometheus.yml` :

```bash
docker kill --signal=SIGHUP goosee-prometheus
```

Validation hors ligne (si `promtool` / `amtool` sont installés) :

```bash
promtool check rules docker/observability/rules/alerts.yml
amtool check-config docker/observability/alertmanager.yml
```
