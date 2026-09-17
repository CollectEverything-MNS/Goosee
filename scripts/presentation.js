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
 * Variables (env/.env.dev) : PRESENTATION_K8S_COUNT (défaut 2, max 4),
 * PRESENTATION_DOCKER_COUNT (défaut 1, max 2), TENANT_BASE_DOMAIN, K8S_INGRESS_PORT.
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execSync, spawn } = require('child_process');
const bcrypt = require('bcryptjs');

const HOST_ENV = { ...process.env };
const ROOT = path.join(__dirname, '..');
const VITRINE = path.join(ROOT, '..', 'goosee-vitrine');

// Charge env/.env.dev dans process.env (sans écraser les variables déjà définies dans le shell)
// pour piloter la démo depuis un .env : PRESENTATION_K8S_COUNT, PRESENTATION_DOCKER_COUNT, etc.
(function loadEnvDev() {
  const file = path.join(ROOT, 'env', '.env.dev');
  if (!fs.existsSync(file)) return;
  const parsed = require('dotenv').parse(fs.readFileSync(file));
  for (const [key, value] of Object.entries(parsed)) if (process.env[key] === undefined) process.env[key] = value;
})();

const BASE_DOMAIN = process.env.TENANT_BASE_DOMAIN || '127.0.0.1.nip.io';
const K8S_PORT = process.env.K8S_INGRESS_PORT || '8081';
// Nombre de sites K8s de Bob réellement déployés (réglable dans env/.env.dev). Défaut : 2.
const K8S_COUNT = Math.min(Number(process.env.PRESENTATION_K8S_COUNT ?? 1), 4);
const CLUSTER = 'goosee';
const DEMO_PW = 'Demo#2026';
const CHART = path.join(ROOT, 'k8s', 'goosee-tenant');
const TENANT_COMPOSE = path.join(ROOT, 'docker', 'tenant', 'docker-compose.tenant.yml');
const TRAEFIK_COMPOSE = path.join(ROOT, 'docker', 'tenant', 'docker-compose.traefik.yml');
const OBS_COMPOSE = path.join(ROOT, 'docker', 'observability', 'docker-compose.observability.yml');
const OBS_DEMO = path.join(ROOT, 'docker', 'observability', 'docker-compose.demo.yml');
const TENANTS_ONLY = process.argv.includes('--tenants-only');
const ASSISTANT = process.env.PRESENTATION_ASSISTANT !== '0';
const COMPOSE_PROFILE = ASSISTANT ? '--profile assistant' : '';
const DYNAMIC_DIR = path.join(ROOT, 'docker', 'tenant', 'dynamic');
const ENVS_DIR = path.join(ROOT, 'docker', 'tenant', 'envs');
const TARGETS_DIR = path.join(ROOT, 'docker', 'observability', 'targets');
const PG = 'goosee-postgres-dev';

const { buildImages, images: IMAGES } = require('./build-demo-images');

// Sous-ensemble réellement déployé + peuplé (le reste reste registre/STOPPED, démarrable
// à la demande). Défaut : 1 site Docker + 1 site K8s (réglable dans env/.env.dev).
const DOCKER_COUNT = Math.min(Number(process.env.PRESENTATION_DOCKER_COUNT ?? 1), 2);
// Nom réel du propriétaire de chaque site (seedé comme OWNER dans le site généré → l'admin
// affiche « Alice Martin »/« Bob Durand » et non un générique « Admin Goosee »).
const OWNERS = {
  'alice@goosee.dev': { firstName: 'Alice', lastName: 'Martin' },
  'bob@goosee.dev': { firstName: 'Bob', lastName: 'Durand' },
};
const withOwner = (s) => ({ ...s, ...(OWNERS[s.owner] ?? { firstName: 'Admin', lastName: 'Goosee' }) });
const ALL_DOCKER = [
  { slug: 'atelier-alice', owner: 'alice@goosee.dev' },
  { slug: 'resto-bob', owner: 'bob@goosee.dev' },
].map(withOwner);
const ALL_K8S = [
  { slug: 'mode-bob', owner: 'bob@goosee.dev' },
  { slug: 'tech-bob', owner: 'bob@goosee.dev' },
  { slug: 'deco-bob', owner: 'bob@goosee.dev' },
  { slug: 'sport-bob', owner: 'bob@goosee.dev' },
].map(withOwner);
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
    env: { ...HOST_ENV, MSYS_NO_PATHCONV: '1' },
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
function savedSecrets(slug) {
  fs.mkdirSync(ENVS_DIR, { recursive: true });
  const file = path.join(ENVS_DIR, slug + '.env');
  if (fs.existsSync(file)) {
    const saved = Object.fromEntries(fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).map((line) => { const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)]; }));
    if (saved.DB_PASSWORD) return saved;
    // Ancien fichier Kubernetes : seul le jeton interne était conservé.
    // Ne régénérer qu'après confirmation de l'absence du namespace.
    const namespace = run('kubectl --context k3d-goosee get namespace tenant-' + slug + ' --ignore-not-found -o name', { capture: true }).trim();
    if (namespace) throw new Error('Secrets incomplets pour ' + slug + ' : récupérer les secrets du namespace existant.');
    const restored = { ...tenantSecrets(slug), ...saved };
    fs.writeFileSync(file, Object.entries(restored).map(([k,v]) => k + '=' + v).join('\n') + '\n');
    return restored;
  }
  const secrets = tenantSecrets(slug);
  fs.writeFileSync(file, Object.entries(secrets).map(([k,v]) => k + '=' + v).join('\n') + '\n');
  return secrets;
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
  if (![DOCKER_COUNT, K8S_COUNT].every(Number.isInteger) || DOCKER_COUNT < 0 || K8S_COUNT < 0) throw new Error('Nombre de tenants invalide');
  if (ASSISTANT && !process.env.GEMINI_API_KEY) throw new Error('PRESENTATION_ASSISTANT=1 nécessite GEMINI_API_KEY');
  if (!TENANTS_ONLY && !fs.existsSync(path.join(VITRINE, 'package.json'))) throw new Error('Dépôt goosee-vitrine absent');
  log('Préflight');
  // Commandes de version SANS connectivité (le cluster n'existe pas encore).
  const tools = {
    docker: 'docker --version',
    ...(K8S_COUNT ? { k3d: 'k3d version', helm: 'helm version', kubectl: 'kubectl version --client' } : {}),
  };
  for (const [t, cmd] of Object.entries(tools)) {
    if (!cap(cmd)) throw new Error(`${t} introuvable sur le PATH.`);
    ok(`${t} disponible`);
  }
}
function ensureImages() {
  if (process.argv.includes('--skip-build')) { for (const image of IMAGES) run(`docker image inspect ${image}`, { capture: true }); return; }
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = '';
  process.env.NEXT_PUBLIC_DEMO_PAYMENT = 'true';
  buildImages();
}
function ensureCluster() {
  if (!K8S_SITES.length) return;
  log('Cluster k3d');
  const list = cap('k3d cluster list --no-headers');
  if (!list.split('\n').some((l) => l.startsWith(CLUSTER))) {
    run(`k3d cluster create ${CLUSTER} --api-port 127.0.0.1:6445 -p "${K8S_PORT}:80@loadbalancer" -p "8443:443@loadbalancer" --agents 0 --servers-memory 5g`);
    ok('cluster créé');
  } else {
    run(`k3d cluster start ${CLUSTER}`);
    ok('cluster déjà présent');
  }
  run('docker update --cpus 2 k3d-goosee-server-0', { capture: true });
  const cachePath = path.join(ENVS_DIR, 'image-cache.json');
  const clusterId = cap('docker inspect k3d-goosee-server-0 --format "{{.Id}}"');
  const current = Object.fromEntries(IMAGES.map((image) => [image, cap('docker image inspect ' + image + ' --format "{{.Id}}"')]));
  let previous = {};
  try { previous = JSON.parse(fs.readFileSync(cachePath, 'utf8')); } catch { /* premier import */ }
  const changed = IMAGES.filter((image) => previous.clusterId !== clusterId || previous.images?.[image] !== current[image]);
  if (changed.length) {
    log('Import de ' + changed.length + ' images dans k3d');
    run(`k3d image import -c ${CLUSTER} ${changed.join(' ')}`);
    fs.mkdirSync(ENVS_DIR, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify({ clusterId, images: current }));
  } else ok('Images déjà importées');
}
function ensurePlatform() {
  log('Plateforme : Traefik + Prometheus');
  run(`docker compose -f "${TRAEFIK_COMPOSE}" up -d`);
  run(`docker compose -f "${OBS_COMPOSE}" -f "${OBS_DEMO}" up -d`);
  ok('Traefik (:80) + Prometheus (:9090)');
}

// ---------------------------------------------------------------- Vitrine

async function startVitrine() {
  log('Vitrine (portail + control plane)');
  const vitrineEnv = { ...HOST_ENV, NEXT_TELEMETRY_DISABLED: '1', UV_THREADPOOL_SIZE: '2' };
  for (const line of fs.readFileSync(path.join(VITRINE, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) vitrineEnv[match[1]] = match[2];
  }
  const opts = { cwd: VITRINE, env: vitrineEnv };
  run('docker compose -f docker-compose.dev.yml up -d --wait --wait-timeout 90', opts);
  if (!fs.existsSync(path.join(VITRINE, 'node_modules'))) run('corepack yarn install --frozen-lockfile', opts);
  run('corepack yarn workspace api migration:run', opts);
  run('corepack yarn workspace orchestrator migration:run', opts);
  const logsDir = path.join(VITRINE, '.presentation-logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const webPort = Number(new URL(vitrineEnv.CORS_ORIGIN || 'http://localhost:3100').port || 80);
  vitrineEnv.PORT = String(webPort);
  vitrineEnv.RAYON_NUM_THREADS = '2';
  const apps = [['orchestrator', Number(vitrineEnv.ORCHESTRATOR_PORT || 4000), '/health'], ['api', Number(vitrineEnv.GOOSEE_PORT || 3102), '/health'], ['web', webPort, '/fr']];
  for (const [app, port, route] of apps) {
    const listening = await new Promise((resolve) => {
      const socket = require('net').connect({ host: '127.0.0.1', port });
      socket.setTimeout(1000);
      socket.on('connect', () => { socket.destroy(); resolve(true); });
      socket.on('error', () => resolve(false));
      socket.on('timeout', () => { socket.destroy(); resolve(false); });
    });
    if (listening) { ok(app + ' déjà à l’écoute sur ' + port); continue; }
    const appEnv = { ...vitrineEnv, ...(app === 'web' ? { NODE_ENV: 'production' } : {}) };
    run('corepack yarn workspace ' + app + ' build', { ...opts, env: appEnv });
    const out = fs.openSync(path.join(logsDir, app + '.log'), 'a');
    const child = spawn('corepack', ['yarn', 'workspace', app, app === 'web' ? 'start' : 'start:prod'], {
      cwd: VITRINE, detached: true, stdio: ['ignore', out, out], shell: true,
      windowsHide: true, env: appEnv,
    });
    child.unref();
    fs.closeSync(out);
    await retry(async () => {
      const response = await fetch('http://localhost:' + port + route, { signal: AbortSignal.timeout(5000) });
      if (response.status >= 500) throw new Error(app + ' pas prêt');
    }, app + ' démarrage', 40);
  }
  ok('Vitrine : ' + vitrineEnv.CORS_ORIGIN + ' ; logs dans goosee-vitrine/.presentation-logs');
}

function seedAccounts() {
  log('Comptes de démonstration');
  run('node scripts/seed-demo.js');
}

// ---------------------------------------------------------------- Données d'un tenant (via gateway)

const { seedTenantData, retry } = require('./demo-data');

// ---------------------------------------------------------------- Provisioning Docker

async function seedOwnerDocker(slug, email, password, firstName = 'Admin', lastName = 'Goosee') {
  const project = `tenant-${slug}`;
  const hash = bcrypt.hashSync(password, 12);
  const tmp = path.join(os.tmpdir(), `goosee-owner-${slug}`);
  fs.writeFileSync(
    `${tmp}-auth.sql`,
    `INSERT INTO auth (email, password, role, "isVerified", "verifiedAt") VALUES ('${esc(email)}', '${hash}', '{OWNER}', true, now()) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, "isVerified" = true, "verifiedAt" = now() RETURNING id;`,
    'utf8'
  );
  const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  for (let i = 1; i <= 40; i += 1) {
    const out = cap(`docker compose -p ${project} --env-file "${path.join(ENVS_DIR, slug + '.env')}" -f "${TENANT_COMPOSE}" exec -T auth-db psql -U postgres -v ON_ERROR_STOP=1 -d auth_db -tA < "${tmp}-auth.sql"`);
    // psql renvoie l'id RETURNING + le tag de commande (« INSERT 0 1 ») : n'extraire que l'UUID,
    // sinon il finit dans user.authId et /users/me (lookup par authId) renvoie 404.
    const authId = (out.match(UUID_RE) || [])[0];
    if (authId) {
      fs.writeFileSync(
        `${tmp}-user.sql`,
        `INSERT INTO "user" ("authId", email, "firstName", "lastName", role) VALUES ('${authId}', '${esc(email)}', '${esc(firstName)}', '${esc(lastName)}', '{OWNER}') ON CONFLICT (email) DO UPDATE SET "authId" = EXCLUDED."authId", "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName", role = EXCLUDED.role;`,
        'utf8'
      );
      run(`docker compose -p ${project} --env-file "${path.join(ENVS_DIR, slug + '.env')}" -f "${TENANT_COMPOSE}" exec -T user-db psql -U postgres -v ON_ERROR_STOP=1 -d user_db < "${tmp}-user.sql"`, { capture: true });
      return true;
    }
    process.stdout.write(`  … schéma ${slug} pas prêt (${i}/40)\r`);
    await sleep(3000);
  }
  return false;
}

async function provisionDocker(site) {
  const { slug, owner, firstName, lastName } = site;
  log(`Site Docker : ${slug}`);
  const project = `tenant-${slug}`;
  const secrets = savedSecrets(slug);
  fs.mkdirSync(ENVS_DIR, { recursive: true });
  const envPath = path.join(ENVS_DIR, `${slug}.env`);
  fs.writeFileSync(
    envPath,
    [
      `TENANT_SLUG=${slug}`, 'JWT_ACCESS_EXPIRES_IN=15m', 'JWT_REFRESH_EXPIRES_IN=7d',
      ...Object.entries(secrets).map(([k, v]) => `${k}=${v}`),
      'STRIPE_SECRET_KEY=', 'STRIPE_WEBHOOK_SECRET=',
      `GEMINI_API_KEY=${ASSISTANT ? process.env.GEMINI_API_KEY : ''}`,
      `GEMINI_MODEL=${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`,
    ].join('\n') + '\n',
    'utf8'
  );
  run(`docker compose --parallel 1 -p ${project} --env-file "${envPath}" -f "${TENANT_COMPOSE}" ${COMPOSE_PROFILE} up -d --wait --wait-timeout 300`);

  fs.mkdirSync(DYNAMIC_DIR, { recursive: true });
  fs.writeFileSync(path.join(DYNAMIC_DIR, `${slug}.yml`), traefikRoute(slug), 'utf8');
  run('docker restart goosee-traefik', { capture: true });

  fs.mkdirSync(TARGETS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(TARGETS_DIR, `${slug}.json`),
    JSON.stringify([{ targets: [`${slug}-gateway:3001`], labels: { tenant: slug, infra: 'docker' } }])
  );

  ok('stack démarrée, seed OWNER…');
  const seeded = await seedOwnerDocker(slug, owner, DEMO_PW, firstName, lastName);
  if (!seeded) throw new Error('Seed OWNER non confirmé : ' + slug);
  await seedTenantData(dockerApiUrl(slug), owner, DEMO_PW);
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
  const { slug, owner, firstName, lastName } = site;
  log(`Site Kubernetes : ${slug}`);
  const secrets = savedSecrets(slug);
  const hash = bcrypt.hashSync(DEMO_PW, 12);
  const values = {
    tenant: { slug, domain: BASE_DOMAIN, publicPort: K8S_PORT },
    image: { revision: crypto.createHash('sha256').update(IMAGES.map((image) => cap('docker image inspect ' + image + ' --format "{{.Id}}"')).join('')).digest('hex').slice(0,16) },
    secrets: {
      dbPassword: secrets.DB_PASSWORD, jwtSecret: secrets.JWT_SECRET,
      jwtAccessSecret: secrets.JWT_ACCESS_SECRET, jwtRefreshSecret: secrets.JWT_REFRESH_SECRET,
      internalApiToken: secrets.INTERNAL_API_TOKEN, minioRootUser: secrets.MINIO_ROOT_USER,
      minioRootPassword: secrets.MINIO_ROOT_PASSWORD,
      // Sans la clé secrète, le payment-service tombe en mode mock et le front (clé publique
      // inlinée au build) échoue à confirmer le paiement Stripe.
      stripeSecretKey: '', stripeWebhookSecret: '',
      geminiApiKey: ASSISTANT ? process.env.GEMINI_API_KEY : '',
    },
    resources: { app: { requests: { cpu: "100m", memory: "96Mi" } } },
    assistant: { enabled: ASSISTANT, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' },
    owner: { email: owner, passwordHash: hash, firstName, lastName },
  };
  const valuesPath = path.join(os.tmpdir(), `goosee-values-${slug}.yaml`);
  fs.writeFileSync(valuesPath, toYaml(values), 'utf8');
  run(`helm --kube-context k3d-goosee upgrade --install ${slug} "${CHART}" -n tenant-${slug} --create-namespace --wait --timeout 12m -f "${valuesPath}"`);
  // env file pour la supervision (jeton interne)
  fs.mkdirSync(ENVS_DIR, { recursive: true });
  const envPath = path.join(ENVS_DIR, `${slug}.env`);
  fs.rmSync(valuesPath, { force: true });
  fs.mkdirSync(TARGETS_DIR, { recursive: true });
  fs.writeFileSync(path.join(TARGETS_DIR, slug + '.json'), JSON.stringify([{targets: [new URL(k8sApiUrl(slug)).host], labels: {tenant: slug, infra: 'k8s'}}]));
  await seedTenantData(k8sApiUrl(slug), owner, DEMO_PW);
  activate(slug, 'k8s', envPath);
  return { slug, owner, infra: 'k8s', url: k8sInstanceUrl(slug), seeded: true };
}

// ---------------------------------------------------------------- Statut + résumé + teardown

function activate(slug, infra, secretsRef) {
  if (TENANTS_ONLY) return;
  const instUrl = infra === 'k8s' ? k8sInstanceUrl(slug) : dockerInstanceUrl(slug);
  const aUrl = infra === 'k8s' ? k8sApiUrl(slug) : dockerApiUrl(slug);
  const ref = secretsRef.replace(/\\/g, '/');
  psql('orchestrator_db', `UPDATE tenants SET status='ACTIVE', "instanceUrl"='${instUrl}', "apiUrl"='${aUrl}', "secretsRef"='${esc(ref)}' WHERE slug='${esc(slug)}';`);
  psql('vitrine_db', `UPDATE projects SET status='ACTIVE', "instanceUrl"='${instUrl}' WHERE subdomain='${esc(slug)}';`);
}

function down() {
  log('Arrêt de la démo (données conservées)');
  for (const site of ALL_DOCKER) {
    const envPath = path.join(ENVS_DIR, site.slug + '.env');
    if (fs.existsSync(envPath)) run(`docker compose -p tenant-${site.slug} --env-file "${envPath}" -f "${TENANT_COMPOSE}" --profile assistant stop`);
  }
  if (cap('k3d cluster list --no-headers').split('\n').some((line) => line.startsWith(CLUSTER))) run('k3d cluster stop ' + CLUSTER);
  run(`docker compose -f "${OBS_COMPOSE}" -f "${OBS_DEMO}" stop`);
  run(`docker compose -f "${TRAEFIK_COMPOSE}" stop`);
  ok('Tenants et supervision arrêtés, volumes conservés. Vitrine laissée disponible.');
}

function summary(sites) {
  console.log('\n\x1b[1m═══════════════ PRÉSENTATION GOOSEE PRÊTE ═══════════════\x1b[0m');
  if (!TENANTS_ONLY) console.log('\n  \x1b[1mPortail vitrine\x1b[0m : http://localhost:3100');
  console.log('    superadmin@goosee.dev / Superadmin#2026  (→ /fr/superadmin)');
  console.log('    alice@goosee.dev / Demo#2026  · bob@goosee.dev / Demo#2026');
  console.log('    Paiements simulés ; chatbot Gemini activé si configuré.');
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
  if (process.argv.includes('--preflight')) return;
  ensureImages();
  ensureCluster();
  ensurePlatform();
  if (!TENANTS_ONLY) {
    await startVitrine();
    seedAccounts();
  }

  const sites = [];
  for (const s of DOCKER_SITES) sites.push(await provisionDocker(s));
  for (const s of K8S_SITES) sites.push(await provisionK8s(s));
  summary(sites.filter((s) => s.seeded));
}

main().catch((err) => {
  console.error(`\n\x1b[31m✗ ${err.message}\x1b[0m`);
  process.exit(1);
});
