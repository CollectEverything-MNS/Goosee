/* eslint-disable no-console */
/**
 * Présentation « tout-en-un » du POC Goosee (voir scenario.md).
 *
 *   yarn presentation         → monte la démo complète
 *   yarn presentation:down    → démonte (tenants + plateforme + vitrine)
 *
 * Étapes (idempotentes) :
 *   1. Préflight + images + cluster k3d.
 *   2. Plateforme : Traefik + Prometheus.
 *   3. Vitrine : Postgres + migrations + orchestrateur/api/web (en arrière-plan).
 *   4. Comptes de démo (seed-demo) : superadmin, alice (1 site), bob (5 sites).
 *   5. Déploiement + données d'un sous-ensemble (Alice + Bob Docker + N K8s),
 *      identifiants OWNER déterministes (Demo#2026), puis statut ACTIVE.
 *   6. Récapitulatif (URLs + comptes en clair).
 *
 * Variables : PRESENTATION_K8S_COUNT (défaut 1, max 4), TENANT_BASE_DOMAIN, K8S_INGRESS_PORT.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');
const bcrypt = require('bcryptjs');

const ROOT = path.join(__dirname, '..');
const VITRINE = path.join(ROOT, '..', 'goosee-vitrine');
const BASE_DOMAIN = process.env.TENANT_BASE_DOMAIN || '127.0.0.1.nip.io';
const K8S_PORT = process.env.K8S_INGRESS_PORT || '8081';
const K8S_COUNT = Math.min(Number(process.env.PRESENTATION_K8S_COUNT || 1), 4);
const CLUSTER = 'goosee';
const DEMO_PW = 'Demo#2026';
const CHART = path.join(ROOT, 'k8s', 'goosee-tenant');
const TENANT_COMPOSE = path.join(ROOT, 'docker', 'tenant', 'docker-compose.tenant.yml');
const TRAEFIK_COMPOSE = path.join(ROOT, 'docker', 'tenant', 'docker-compose.traefik.yml');
const OBS_COMPOSE = path.join(ROOT, 'docker', 'observability', 'docker-compose.observability.yml');
const DYNAMIC_DIR = path.join(ROOT, 'docker', 'tenant', 'dynamic');
const ENVS_DIR = path.join(ROOT, 'docker', 'tenant', 'envs');
const TARGETS_DIR = path.join(ROOT, 'docker', 'observability', 'targets');
const PG = 'goosee-postgres-dev';

const IMAGES = [
  'api-gateway', 'front', 'auth-service', 'user-service', 'page-service', 'log-service',
  'product-service', 'order-service', 'cart-service', 'payment-service', 'notifier-service',
].map((n) => `goosee/${n}:local`);

// Sous-ensemble réellement déployé + peuplé (le reste reste registre/STOPPED, démarrable
// à la demande). Défaut allégé : 1 site Docker + 1 site K8s.
const DOCKER_COUNT = Math.min(Number(process.env.PRESENTATION_DOCKER_COUNT || 1), 2);
const ALL_DOCKER = [
  { slug: 'atelier-alice', owner: 'alice@goosee.dev' },
  { slug: 'resto-bob', owner: 'bob@goosee.dev' },
];
const ALL_K8S = [
  { slug: 'mode-bob', owner: 'bob@goosee.dev' },
  { slug: 'tech-bob', owner: 'bob@goosee.dev' },
  { slug: 'deco-bob', owner: 'bob@goosee.dev' },
  { slug: 'sport-bob', owner: 'bob@goosee.dev' },
];
const DOCKER_SITES = ALL_DOCKER.slice(0, DOCKER_COUNT);
const K8S_SITES = ALL_K8S.slice(0, K8S_COUNT);

const rand = (n = 24) => crypto.randomBytes(n).toString('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(`\n\x1b[36m▶ ${m}\x1b[0m`);
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: opts.cwd || ROOT,
    stdio: opts.capture ? 'pipe' : 'inherit',
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
    encoding: 'utf8',
    shell: true,
    ...opts,
  });
}
const cap = (cmd, opts = {}) => {
  try {
    return run(cmd, { ...opts, capture: true }).toString().trim();
  } catch {
    return '';
  }
};
const psql = (db, sql) => {
  const tmp = path.join(os.tmpdir(), `goosee-pres-${rand(4)}.sql`);
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    run(`docker exec -i ${PG} psql -U postgres -d ${db} -tA < "${tmp}"`, { capture: true });
  } finally {
    fs.rmSync(tmp, { force: true });
  }
};
const esc = (s) => String(s).replace(/'/g, "''");

function tenantSecrets(slug) {
  return {
    JWT_SECRET: rand(), JWT_ACCESS_SECRET: rand(), JWT_REFRESH_SECRET: rand(),
    INTERNAL_API_TOKEN: rand(), DB_PASSWORD: rand(),
    MINIO_ROOT_USER: `tenant_${slug.replace(/-/g, '_')}`, MINIO_ROOT_PASSWORD: rand(),
  };
}
const envDevValue = (key) => {
  try {
    const m = fs.readFileSync(path.join(ROOT, 'env', '.env.dev'), 'utf8').match(new RegExp(`^${key}=(.*)$`, 'm'));
    return m ? m[1].trim() : '';
  } catch {
    return '';
  }
};
const dockerInstanceUrl = (slug) => `http://${slug}.${BASE_DOMAIN}`;
const dockerApiUrl = (slug) => `http://api.${slug}.${BASE_DOMAIN}`;
const k8sInstanceUrl = (slug) => `http://${slug}.${BASE_DOMAIN}:${K8S_PORT}`;
const k8sApiUrl = (slug) => `http://api.${slug}.${BASE_DOMAIN}:${K8S_PORT}`;

// ---------------------------------------------------------------- Setup

function preflight() {
  log('Préflight');
  // Commandes de version SANS connectivité (le cluster n'existe pas encore).
  const tools = {
    docker: 'docker --version',
    k3d: 'k3d version',
    helm: 'helm version',
    kubectl: 'kubectl version --client',
  };
  for (const [t, cmd] of Object.entries(tools)) {
    if (!cap(cmd)) throw new Error(`${t} introuvable sur le PATH.`);
    ok(`${t} disponible`);
  }
}
const BUILD = [
  ['api-gateway', 'templates/back/api-gateway/Dockerfile'],
  ['auth-service', 'templates/back/services/auth-service/Dockerfile'],
  ['user-service', 'templates/back/services/user-service/Dockerfile'],
  ['page-service', 'templates/back/services/page-service/Dockerfile'],
  ['log-service', 'templates/back/services/log-service/Dockerfile'],
  ['product-service', 'templates/back/services/product-service/Dockerfile'],
  ['order-service', 'templates/back/services/order-service/Dockerfile'],
  ['cart-service', 'templates/back/services/cart-service/Dockerfile'],
  ['payment-service', 'templates/back/services/payment-service/Dockerfile'],
  ['notifier-service', 'templates/back/services/notifier-service/Dockerfile'],
  ['front', 'templates/front/Dockerfile'],
];

function ensureImages() {
  log('Images du site généré (build — cache Docker si inchangé)');
  // Build en Node (pas de dépendance à bash) : garantit des images à jour (routes
  // order/cart/payment, storefront + clé Stripe). Cache Docker → rapide si inchangé.
  const stripePk = envDevValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  for (const [name, dockerfile] of BUILD) {
    const arg = name === 'front' ? `--build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${stripePk}` : '';
    run(`docker build ${arg} -f "${dockerfile}" -t "goosee/${name}:local" .`);
  }
  ok('images goosee/*:local à jour');
}
function ensureCluster() {
  if (!K8S_SITES.length) return;
  log('Cluster k3d');
  const list = cap('k3d cluster list --no-headers');
  if (!list.split('\n').some((l) => l.startsWith(CLUSTER))) {
    run(`k3d cluster create ${CLUSTER} --api-port 127.0.0.1:6445 -p "${K8S_PORT}:80@loadbalancer" -p "8443:443@loadbalancer" --agents 0`);
    ok('cluster créé');
  } else ok('cluster déjà présent');
  log('Import des images dans k3d'); run(`k3d image import -c ${CLUSTER} ${IMAGES.join(' ')}`);
}
function ensurePlatform() {
  log('Plateforme : Traefik + Prometheus');
  run(`docker compose -f "${TRAEFIK_COMPOSE}" up -d`);
  run(`docker compose -f "${OBS_COMPOSE}" up -d`);
  ok('Traefik (:80) + Prometheus (:9090)');
}

// ---------------------------------------------------------------- Vitrine

function startVitrine() {
  log('Vitrine (portail + control plane)');
  run('docker compose -f docker-compose.dev.yml up -d', { cwd: VITRINE });
  run('corepack yarn install', { cwd: VITRINE, capture: true });
  run('corepack yarn workspace api migration:run', { cwd: VITRINE, capture: true });
  run('corepack yarn workspace orchestrator migration:run', { cwd: VITRINE, capture: true });
  // Le front est servi en PRODUCTION (build + next start) : `next dev` est instable sous
  // Windows avec next-intl (chunks vendor @formatjs manquants → 500 + recompilations qui
  // rament). On repart d'un .next propre puis on build une fois.
  log('Build du front (prod, ~30-60s)');
  fs.rmSync(path.join(VITRINE, 'apps', 'web', '.next'), { recursive: true, force: true });
  run('corepack yarn workspace web build', { cwd: VITRINE });

  const logsDir = path.join(VITRINE, '.presentation-logs');
  fs.mkdirSync(logsDir, { recursive: true });
  // api/orchestrateur en dev (légers), front en prod (stable).
  const procs = [['orchestrator', 'dev'], ['api', 'dev'], ['web', 'start']];
  for (const [app, mode] of procs) {
    const out = fs.openSync(path.join(logsDir, `${app}.log`), 'a');
    const child = spawn('corepack', ['yarn', 'workspace', app, mode], {
      cwd: VITRINE, detached: true, stdio: ['ignore', out, out], shell: true,
      env: { ...process.env, MSYS_NO_PATHCONV: '1' },
    });
    child.unref();
  }
  ok('Vitrine démarrée : web :3000 (prod) · api :3002 · orchestrateur :4000 (logs: .presentation-logs/)');
}

function seedAccounts() {
  log('Comptes de démonstration');
  run('node scripts/seed-demo.js');
}

// ---------------------------------------------------------------- Données d'un tenant (via gateway)

async function api(method, base, route, token, body) {
  const res = await fetch(`${base}${route}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${route} -> ${res.status}`);
  return res.status === 204 ? {} : res.json();
}

// Attend que l'API du tenant soit prête (gateway + auth-service up) puis renvoie un token.
// Les services jouent leurs migrations au boot : un 503/refus est normal au début.
async function loginWithRetry(base, email, password) {
  for (let i = 1; i <= 60; i += 1) {
    try {
      const r = await api('POST', base, '/auth/login', null, { email, password });
      if (r.accessToken) return r.accessToken;
    } catch (e) {
      if (!/(\b50[234]\b|fetch failed|ECONNREFUSED|ENOTFOUND|EAI_AGAIN)/i.test(e.message)) throw e;
    }
    process.stdout.write(`  … API du tenant pas prête (${i}/60)\r`);
    await sleep(3000);
  }
  throw new Error('API du tenant non prête (login en échec après ~3 min)');
}

// Peuple un site : clients, catégorie, produits, commandes (dont payées) → KPI non nuls.
async function seedTenantData(base, ownerEmail, ownerPassword) {
  const token = await loginWithRetry(base, ownerEmail, ownerPassword);

  // Clients (s'inscrivent sur le site)
  const customers = [
    { firstName: 'Léa', lastName: 'Bernard', email: `lea@${rand(3)}.test` },
    { firstName: 'Marc', lastName: 'Petit', email: `marc@${rand(3)}.test` },
    { firstName: 'Sofia', lastName: 'Rossi', email: `sofia@${rand(3)}.test` },
  ];
  for (const c of customers) {
    await api('POST', base, '/auth/register', null, { ...c, password: 'Client#2026' }).catch(() => undefined);
  }

  const cat = await api('POST', base, '/categories', token, { name: 'Boutique' });
  const catId = cat.category?.id ?? cat.id;
  const defs = [
    { name: 'Café signature', price: 3.5, stock: 120 },
    { name: 'Thé bio', price: 4.2, stock: 80 },
    { name: 'Cookie maison', price: 2.8, stock: 200 },
    { name: 'Formule déjeuner', price: 12.9, stock: 60 },
  ];
  const products = [];
  for (const d of defs) {
    const r = await api('POST', base, '/products', token, { ...d, categoryId: catId });
    const p = r.product ?? r;
    products.push({ id: p.id, name: d.name, cents: Math.round(d.price * 100) });
  }

  // Commandes (quelques-unes marquées payées → CA)
  let paid = 0;
  for (let i = 0; i < 5; i += 1) {
    const picks = products.slice(0, 1 + (i % 3)).map((p) => ({
      productId: p.id, name: p.name, unitPriceCents: p.cents, quantity: 1 + (i % 2),
    }));
    const ord = await api('POST', base, '/orders', null, {
      customerEmail: customers[i % customers.length].email, items: picks,
    });
    const oid = ord.order?.id ?? ord.id;
    if (oid && i % 2 === 0) {
      await api('PATCH', base, `/orders/${oid}/status`, token, { status: 'paid' }).catch(() => undefined);
      paid += 1;
    }
  }
  ok(`données seedées (${customers.length} clients, ${products.length} produits, 5 commandes dont ${paid} payées)`);
}

// ---------------------------------------------------------------- Provisioning Docker

async function seedOwnerDocker(slug, email, password) {
  const project = `tenant-${slug}`;
  const hash = bcrypt.hashSync(password, 12);
  const tmp = path.join(os.tmpdir(), `goosee-owner-${slug}`);
  fs.writeFileSync(
    `${tmp}-auth.sql`,
    `INSERT INTO auth (email, password, role, "isVerified", "verifiedAt") VALUES ('${esc(email)}', '${hash}', '{OWNER}', true, now()) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, "isVerified" = true, "verifiedAt" = now() RETURNING id;`,
    'utf8'
  );
  for (let i = 1; i <= 40; i += 1) {
    const authId = cap(`docker compose -p ${project} exec -T auth-db psql -U postgres -d auth_db -tA < "${tmp}-auth.sql"`);
    if (authId && /[0-9a-f-]{36}/.test(authId)) {
      fs.writeFileSync(
        `${tmp}-user.sql`,
        `INSERT INTO "user" ("authId", email, "firstName", "lastName", role) VALUES ('${authId.trim()}', '${esc(email)}', 'Admin', 'Goosee', '{OWNER}') ON CONFLICT (email) DO UPDATE SET "authId" = EXCLUDED."authId", role = EXCLUDED.role;`,
        'utf8'
      );
      run(`docker compose -p ${project} exec -T user-db psql -U postgres -d user_db < "${tmp}-user.sql"`, { capture: true });
      return true;
    }
    process.stdout.write(`  … schéma ${slug} pas prêt (${i}/40)\r`);
    await sleep(3000);
  }
  return false;
}

async function provisionDocker(site) {
  const { slug, owner } = site;
  log(`Site Docker : ${slug}`);
  const project = `tenant-${slug}`;
  const secrets = tenantSecrets(slug);
  fs.mkdirSync(ENVS_DIR, { recursive: true });
  const envPath = path.join(ENVS_DIR, `${slug}.env`);
  fs.writeFileSync(
    envPath,
    [
      `TENANT_SLUG=${slug}`, 'JWT_ACCESS_EXPIRES_IN=15m', 'JWT_REFRESH_EXPIRES_IN=7d',
      ...Object.entries(secrets).map(([k, v]) => `${k}=${v}`),
      `STRIPE_SECRET_KEY=${envDevValue('STRIPE_SECRET_KEY')}`,
      `STRIPE_WEBHOOK_SECRET=${envDevValue('STRIPE_WEBHOOK_SECRET')}`,
    ].join('\n') + '\n',
    'utf8'
  );
  run(`docker compose -p ${project} --env-file "${envPath}" -f "${TENANT_COMPOSE}" up -d`);

  fs.mkdirSync(DYNAMIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(DYNAMIC_DIR, `${slug}.yml`), traefikRoute(slug), 'utf8');
  run('docker restart goosee-traefik', { capture: true });

  fs.mkdirSync(TARGETS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(TARGETS_DIR, `${slug}.json`),
    JSON.stringify([{ targets: [`${slug}-gateway:3001`], labels: { tenant: slug, infra: 'docker' } }])
  );

  ok('stack démarrée, seed OWNER…');
  const seeded = await seedOwnerDocker(slug, owner, DEMO_PW);
  if (!seeded) { warn('seed OWNER non confirmé'); return { slug, owner, infra: 'docker', url: dockerInstanceUrl(slug), seeded: false }; }
  await seedTenantData(dockerApiUrl(slug), owner, DEMO_PW).catch((e) => warn(`données: ${e.message}`));
  activate(slug, 'docker', envPath);
  return { slug, owner, infra: 'docker', url: dockerInstanceUrl(slug), seeded: true };
}

function traefikRoute(slug) {
  const host = `${slug}.${BASE_DOMAIN}`;
  const apiHost = `api.${slug}.${BASE_DOMAIN}`;
  return `http:
  routers:
    ${slug}-front:
      rule: "Host(\`${host}\`)"
      entryPoints: [web]
      service: ${slug}-front
    ${slug}-gateway:
      rule: "Host(\`${apiHost}\`)"
      entryPoints: [web]
      service: ${slug}-gateway
  services:
    ${slug}-front:
      loadBalancer:
        servers:
          - url: "http://${slug}-front:3000"
    ${slug}-gateway:
      loadBalancer:
        servers:
          - url: "http://${slug}-gateway:3001"
`;
}

// ---------------------------------------------------------------- Provisioning K8s

function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) =>
      v && typeof v === 'object' ? `${pad}${k}:\n${toYaml(v, indent + 1)}` : `${pad}${k}: ${JSON.stringify(v)}`
    )
    .join('\n');
}

async function provisionK8s(site) {
  const { slug, owner } = site;
  log(`Site Kubernetes : ${slug}`);
  const secrets = tenantSecrets(slug);
  const hash = bcrypt.hashSync(DEMO_PW, 12);
  const values = {
    tenant: { slug, domain: BASE_DOMAIN },
    secrets: {
      dbPassword: secrets.DB_PASSWORD, jwtSecret: secrets.JWT_SECRET,
      jwtAccessSecret: secrets.JWT_ACCESS_SECRET, jwtRefreshSecret: secrets.JWT_REFRESH_SECRET,
      internalApiToken: secrets.INTERNAL_API_TOKEN, minioRootUser: secrets.MINIO_ROOT_USER,
      minioRootPassword: secrets.MINIO_ROOT_PASSWORD,
    },
    owner: { email: owner, passwordHash: hash },
  };
  const valuesPath = path.join(os.tmpdir(), `goosee-values-${slug}.yaml`);
  fs.writeFileSync(valuesPath, toYaml(values), 'utf8');
  run(`helm upgrade --install ${slug} "${CHART}" -n tenant-${slug} --create-namespace --wait --timeout 6m -f "${valuesPath}"`);
  // env file pour la supervision (jeton interne)
  fs.mkdirSync(ENVS_DIR, { recursive: true });
  const envPath = path.join(ENVS_DIR, `${slug}.env`);
  fs.writeFileSync(envPath, `INTERNAL_API_TOKEN=${secrets.INTERNAL_API_TOKEN}\n`, 'utf8');
  await seedTenantData(k8sApiUrl(slug), owner, DEMO_PW).catch((e) => warn(`données: ${e.message}`));
  activate(slug, 'k8s', envPath);
  return { slug, owner, infra: 'k8s', url: k8sInstanceUrl(slug), seeded: true };
}

// ---------------------------------------------------------------- Statut + résumé + teardown

function activate(slug, infra, secretsRef) {
  const instUrl = infra === 'k8s' ? k8sInstanceUrl(slug) : dockerInstanceUrl(slug);
  const aUrl = infra === 'k8s' ? k8sApiUrl(slug) : dockerApiUrl(slug);
  const ref = secretsRef.replace(/\\/g, '/');
  psql('orchestrator_db', `UPDATE tenants SET status='ACTIVE', "instanceUrl"='${instUrl}', "apiUrl"='${aUrl}', "secretsRef"='${esc(ref)}' WHERE slug='${esc(slug)}';`);
  psql('vitrine_db', `UPDATE projects SET status='ACTIVE', "instanceUrl"='${instUrl}' WHERE subdomain='${esc(slug)}';`);
}

function down() {
  log('Démontage');
  for (const s of ALL_DOCKER) {
    run(`docker compose -p tenant-${s.slug} down -v`, { capture: true });
    fs.rmSync(path.join(DYNAMIC_DIR, `${s.slug}.yml`), { force: true });
    fs.rmSync(path.join(TARGETS_DIR, `${s.slug}.json`), { force: true });
  }
  for (const s of ALL_K8S) {
    run(`helm uninstall ${s.slug} -n tenant-${s.slug}`, { capture: true });
    run(`kubectl delete namespace tenant-${s.slug} --ignore-not-found`, { capture: true });
  }
  run(`docker compose -f "${OBS_COMPOSE}" down`, { capture: true });
  run(`docker compose -f "${TRAEFIK_COMPOSE}" down`, { capture: true });
  // Vitrine (apps détachées) : à fermer manuellement (logs dans goosee-vitrine/.presentation-logs)
  ok('Tenants + plateforme arrêtés. Vitrine : fermer les process (ports 3000/3002/4000) si besoin.');
}

function summary(sites) {
  console.log('\n\x1b[1m═══════════════ PRÉSENTATION GOOSEE PRÊTE ═══════════════\x1b[0m');
  console.log('\n  \x1b[1mPortail vitrine\x1b[0m : http://localhost:3000');
  console.log('    superadmin@goosee.dev / Superadmin#2026  (→ /fr/superadmin)');
  console.log('    alice@goosee.dev / Demo#2026  · bob@goosee.dev / Demo#2026');
  console.log('    Charlie : à créer en live (scénario 3) — mot de passe au choix.');
  console.log('\n  \x1b[1mSites déployés + peuplés\x1b[0m (OWNER = e-mail vitrine / Demo#2026) :');
  for (const s of sites) {
    console.log(`    ${s.slug} (${s.infra}) — ${s.url}  · admin: ${s.url}/fr/goosee-admin  · owner: ${s.owner}`);
  }
  console.log('\n  Autres sites de Bob : registre/STOPPED (démarrables à la demande).');
  console.log('  Prometheus : http://localhost:9090 · HPA : kubectl get hpa -A');
  console.log('\n  Démontage : yarn presentation:down · Détails : scenario.md\n');
}

async function main() {
  if (process.argv.includes('--down')) { down(); return; }
  preflight();
  ensureImages();
  ensureCluster();
  ensurePlatform();
  startVitrine();
  // Laisse l'orchestrateur/api démarrer + Postgres prêt avant le seed.
  await sleep(8000);
  seedAccounts();

  const sites = [];
  for (const s of DOCKER_SITES) sites.push(await provisionDocker(s));
  for (const s of K8S_SITES) sites.push(await provisionK8s(s));
  summary(sites.filter((s) => s.seeded));
}

main().catch((err) => {
  console.error(`\n\x1b[31m✗ ${err.message}\x1b[0m`);
  process.exit(1);
});
