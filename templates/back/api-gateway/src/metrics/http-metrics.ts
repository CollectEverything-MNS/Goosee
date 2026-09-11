import { Counter, Histogram } from 'prom-client';

/**
 * Métriques RED (Rate / Errors / Duration) du trafic HTTP entrant de la gateway.
 *
 * Les labels sont volontairement à faible cardinalité :
 *  - `route`  : le patron de route Express (`/orders/:id`), jamais l'URL concrète ;
 *  - `status_code` : le code HTTP numérique ;
 *  - `method` : le verbe HTTP.
 *
 * Enregistrées sur le `register` global de prom-client, exposées par
 * `MetricsController` sur `GET /metrics`.
 */

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP traitées par la gateway',
  labelNames: ['method', 'route', 'status_code'] as const,
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP traitées par la gateway (secondes)',
  labelNames: ['method', 'route', 'status_code'] as const,
  // Adapté à une gateway de proxy : de 10 ms (réponse en cache / erreur immédiate)
  // à 10 s (timeout amont).
  buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
