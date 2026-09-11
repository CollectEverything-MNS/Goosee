/**
 * Charge sur un parcours de navigation client anonyme, avec une écriture légère :
 *
 *   GET /products  →  GET /products/:id  →  POST /cart/:sessionKey/items
 *     →  GET /cart/:sessionKey
 *
 * Le panier est identifié par une clé de session (pas d'authentification) et le
 * catalogue est public : le parcours ne se connecte pas. `POST /auth/login` est
 * volontairement limité à 5 requêtes/min (anti-force-brute) et n'a donc pas sa place
 * dans un scénario de charge — la connexion sert uniquement au `setup()` (une fois)
 * pour préparer le catalogue.
 *
 * setup() : connexion OWNER puis, si moins de CATALOG_MIN produits, création d'une
 * catégorie + des produits (stock large). Chaque VU utilise sa propre clé de panier.
 *
 * Lancement (stack dev up + `yarn init:user`) : `yarn load:navigation`
 * Profil : -e SCENARIO=smoke (défaut) | load     — voir profils.js
 * Identifiants OWNER (setup) : -e OWNER_EMAIL / -e OWNER_PASSWORD
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import { stagesPour } from './profils.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const SCENARIO = __ENV.SCENARIO || 'smoke';
const OWNER_EMAIL = __ENV.OWNER_EMAIL || 'admin@goosee.dev';
const OWNER_PASSWORD = __ENV.OWNER_PASSWORD || 'goosee';
const CATALOG_MIN = 10;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  scenarios: {
    navigation: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: stagesPour(SCENARIO),
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    'http_req_duration{name:GET /products}': ['p(95)<400'],
    'http_req_duration{name:GET /products/:id}': ['p(95)<400'],
    'http_req_duration{name:POST /cart/items}': ['p(95)<600'],
  },
};

function login() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: OWNER_EMAIL, password: OWNER_PASSWORD }),
    { headers: JSON_HEADERS }
  );
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(
      `Login OWNER échoué (${res.status}). Stack dev démarrée et "yarn init:user" passé ?`
    );
  }
  return res.json('accessToken');
}

function listerIdsProduits() {
  const res = http.get(`${BASE_URL}/products`);
  if (res.status !== 200) return [];
  try {
    const body = res.json();
    const items = Array.isArray(body) ? body : body.data || body.products || [];
    return items.map((p) => p && p.id).filter(Boolean);
  } catch {
    return [];
  }
}

export function setup() {
  const token = login();

  let ids = listerIdsProduits();
  if (ids.length >= CATALOG_MIN) {
    return { productIds: ids.slice(0, CATALOG_MIN) };
  }

  const auth = { headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` } };
  const cat = http.post(
    `${BASE_URL}/categories`,
    JSON.stringify({ name: `charge-${Date.now()}` }),
    auth
  );
  const catId = cat.json('id') || cat.json('category.id');
  if (!catId) {
    throw new Error(`Création de catégorie impossible (${cat.status}) — seed du catalogue avorté`);
  }

  for (let i = ids.length; i < CATALOG_MIN; i++) {
    http.post(
      `${BASE_URL}/products`,
      JSON.stringify({
        name: `Produit charge ${i}`,
        price: 1500 + i,
        categoryIds: [catId],
        initialStock: 100000,
      }),
      auth
    );
  }

  ids = listerIdsProduits();
  if (ids.length === 0) {
    throw new Error('Catalogue toujours vide après le seed');
  }
  return { productIds: ids.slice(0, CATALOG_MIN) };
}

export default function (data) {
  const sessionKey = `charge-vu-${exec.vu.idInTest}`;
  const productIds = data.productIds;
  const pid = productIds[Math.floor(Math.random() * productIds.length)];

  const liste = http.get(`${BASE_URL}/products`, { tags: { name: 'GET /products' } });
  check(liste, { 'liste 200': (r) => r.status === 200 });

  const detail = http.get(`${BASE_URL}/products/${pid}`, {
    tags: { name: 'GET /products/:id' },
  });
  check(detail, { 'détail 200': (r) => r.status === 200 });

  const ajout = http.post(
    `${BASE_URL}/cart/${sessionKey}/items`,
    JSON.stringify({ productId: pid, name: 'Produit charge', unitPriceCents: 1500, quantity: 1 }),
    { headers: JSON_HEADERS, tags: { name: 'POST /cart/items' } }
  );
  check(ajout, { 'panier 200/201': (r) => r.status === 200 || r.status === 201 });

  const panier = http.get(`${BASE_URL}/cart/${sessionKey}`, {
    tags: { name: 'GET /cart/:key' },
  });
  check(panier, { 'panier lu 200': (r) => r.status === 200 });

  sleep(1);
}
