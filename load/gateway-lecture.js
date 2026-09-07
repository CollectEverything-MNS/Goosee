/**
 * Charge sur les endpoints de lecture de la gateway (le chemin le plus sollicité :
 * pas d'authentification, pas d'écriture).
 *
 *   GET /health  ·  GET /products  ·  GET /products/:id
 *
 * Lancement (stack dev up) : `yarn load:gateway`
 * Profil : -e SCENARIO=smoke (défaut) | load     — voir profils.js
 * Cible  : -e BASE_URL=... (défaut : gateway du réseau goosee_net)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { stagesPour } from './profils.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const SCENARIO = __ENV.SCENARIO || 'smoke';

export const options = {
  scenarios: {
    lecture: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stagesPour(SCENARIO),
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:GET /products}': ['p(95)<500'],
    'http_req_duration{name:GET /health}': ['p(95)<200'],
  },
};

export function setup() {
  const res = http.get(`${BASE_URL}/health`);
  if (res.status !== 200) {
    throw new Error(`Gateway injoignable : GET ${BASE_URL}/health -> ${res.status}`);
  }
}

function idsProduits(reponse) {
  try {
    const body = reponse.json();
    const items = Array.isArray(body) ? body : body.data || body.products || [];
    return items.map((p) => p && p.id).filter(Boolean);
  } catch {
    return [];
  }
}

export default function () {
  const health = http.get(`${BASE_URL}/health`, { tags: { name: 'GET /health' } });
  check(health, { 'health 200': (r) => r.status === 200 });

  const liste = http.get(`${BASE_URL}/products`, { tags: { name: 'GET /products' } });
  check(liste, { 'liste 200': (r) => r.status === 200 });

  const ids = idsProduits(liste);
  if (ids.length > 0) {
    const pid = ids[Math.floor(Math.random() * ids.length)];
    const detail = http.get(`${BASE_URL}/products/${pid}`, {
      tags: { name: 'GET /products/:id' },
    });
    check(detail, { 'détail 200': (r) => r.status === 200 });
  }

  sleep(1);
}
