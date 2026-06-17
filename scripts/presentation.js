/* eslint-disable no-console */
/**
 * Script de présentation « tout-en-un » du POC Goosee.
 *
 *   yarn presentation         → monte la démo complète
 *   yarn presentation:down    → démonte tout (tenants + plateforme)
 *
 * Ce qu'il fait (idempotent) :
 *   1. Préflight (docker, k3d, helm, kubectl) + build des images si besoin.
 *   2. Cluster k3d + import des images.
 *   3. Plateforme : Traefik (réseau goosee_platform) + Prometheus central.
 *   4. 1 tenant Docker (forfait standard) : compose isolé + route Traefik + seed OWNER + cible Prometheus.
 *   5. N tenants Kubernetes (forfait enterprise) : chart Helm (le Job du chart seed l'OWNER).
 *   6. Récapitulatif : URLs, identifiants, Prometheus, commandes de supervision/charge.
 *
 * Variables : PRESENTATION_K8S_COUNT (défaut 2), TENANT_BASE_DOMAIN (défaut 127.0.0.1.nip.io),
 *             K8S_INGRESS_PORT (défaut 8081).
 */
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

const ROOT = path.join(__dirname, '..');
const BASE_DOMAIN = process.env.TENANT_BASE_DOMAIN || '127.0.0.1.nip.io';
const K8S_PORT = process.env.K8S_INGRESS_PORT || '8081';
const K8S_COUNT = Number(process.env.PRESENTATION_K8S_COUNT || 2);
const CLUSTER = 'goosee';
const CHART = path.join(ROOT, 'k8s', 'goosee-tenant');
const TENANT_COMPOSE = path.join(ROOT, 'docker', 'tenant', 'docker-compose.tenant.yml');
const TRAEFIK_COMPOSE = path.join(ROOT, 'docker', 'tenant', 'docker-compose.traefik.yml');
const OBS_COMPOSE = path.join(ROOT, 'docker', 'observability', 'docker-compose.observability.yml');
const DYNAMIC_DIR = path.join(ROOT, 'docker', 'tenant', 'dynamic');
const ENVS_DIR = path.join(ROOT, 'docker', 'tenant', 'envs');
const TARGETS_DIR = path.join(ROOT, 'docker', 'observability', 'targets');

const IMAGES = [
  'api-gateway', 'front', 'auth-service', 'user-service', 'page-service', 'log-service',
  'product-service', 'order-service', 'cart-service', 'payment-service', 'notifier-service',
].map((n) => `goosee/${n}:local`);

const DOCKER_TENANT = process.env.PRESENTATION_DOCKER_SLUG || 'bistrot';
const K8S_TENANTS = Array.from({ length: K8S_COUNT }, (_, i) => `shop-${i + 1}`);

const rand = (n = 24) => crypto.randomBytes(n).toString('hex');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(`\n\x1b[36m▶ ${m}\x1b[0m`);
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const warn = (m) => console.log(`  \x1b[33m!\x1b[0m ${m}`);

// Exécute une commande (shell). MSYS_NO_PATHCONV évite la réécriture de chemins sous Git Bash.
function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: ROOT,
    stdio: opts.capture ? 'pipe' : 'inherit',
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
    encoding: 'utf8',
    shell: true,
    ...opts,
  });
}
function cap(cmd) {
  try {
    return run(cmd, { capture: true }).toString().trim();
  } catch {
    return '';
  }
}

// Récupère une clé du fichier env/.env.dev (clés Stripe pour le tenant Docker).
function envDevValue(key) {
  try {
    const content = fs.readFileSync(path.join(ROOT, 'env', '.env.dev'), 'utf8');
    const m = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return m ? m[1].trim() : '';
  } catch {
    return '';
  }
}

function tenantSecrets(slug) {
  return {
    JWT_SECRET: rand(),
    JWT_ACCESS_SECRET: rand(),
    JWT_REFRESH_SECRET: rand(),
    INTERNAL_API_TOKEN: rand(),
    DB_PASSWORD: rand(),
    MINIO_ROOT_USER: `tenant_${slug.replace(/-/g, '_')}`,
    MINIO_ROOT_PASSWORD: rand(),
  };
}

// ---------------------------------------------------------------- Préflight + images + cluster

function preflight() {
  log('Préflight');
  for (const tool of ['docker', 'k3d', 'helm', 'kubectl']) {
    const v = cap(`${tool} version`);
    if (!v) throw new Error(`${tool} introuvable sur le PATH.`);
    ok(`${tool} disponible`);
  }
}

function ensureImages() {
  log('Images du site généré');
  const present = cap('docker images --format "{{.Repository}}:{{.Tag}}"');
  const missing = IMAGES.filter((img) => !present.includes(img));
  if (missing.length) {
    warn(`${missing.length} image(s) manquante(s) → build complet`);
    run('bash scripts/build-images.sh');
  } else {
    ok('Toutes les images goosee/*:local sont présentes');
  }
}

function ensureCluster() {
  log('Cluster k3d');
  const clusters = cap('k3d cluster list --no-headers');
  if (!clusters.split('\n').some((l) => l.startsWith(CLUSTER))) {
    run(
      `k3d cluster create ${CLUSTER} --api-port 127.0.0.1:6445 ` +
        `-p "${K8S_PORT}:80@loadbalancer" -p "8443:443@loadbalancer" --agents 0`
    );
    ok('Cluster créé');
  } else {
    ok('Cluster déjà présent');
  }
  log('Import des images dans k3d (peut prendre une minute)');
  run(`k3d image import -c ${CLUSTER} ${IMAGES.join(' ')}`);
}

function ensurePlatform() {
  log('Plateforme : Traefik + Prometheus');
  run(`docker compose -f "${TRAEFIK_COMPOSE}" up -d`);
  run(`docker compose -f "${OBS_COMPOSE}" up -d`);
  ok('Traefik (:80) et Prometheus (:9090) démarrés');
}

// ---------------------------------------------------------------- Tenant Docker

async function seedOwnerDocker(slug, email, password) {
  const project = `tenant-${slug}`;
  const hash = bcrypt.hashSync(password, 12);
  const tmp = path.join(os.tmpdir(), `goosee-seed-${slug}`);
  const authSql = `INSERT INTO auth (email, password, role, "isVerified", "verifiedAt") VALUES ('${email}', '${hash}', '{OWNER}', true, now()) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, "isVerified" = true, "verifiedAt" = now() RETURNING id;`;
  fs.writeFileSync(`${tmp}-auth.sql`, authSql, 'utf8');

  for (let i = 1; i <= 40; i += 1) {
    const authId = cap(
      `docker compose -p ${project} exec -T auth-db psql -U postgres -d auth_db -tA < "${tmp}-auth.sql"`
    );
    if (authId && /[0-9a-f-]{36}/.test(authId)) {
      const userSql = `INSERT INTO "user" ("authId", email, "firstName", "lastName", role) VALUES ('${authId.trim()}', '${email}', 'Admin', 'Goosee', '{OWNER}') ON CONFLICT (email) DO UPDATE SET "authId" = EXCLUDED."authId", role = EXCLUDED.role;`;
      fs.writeFileSync(`${tmp}-user.sql`, userSql, 'utf8');
      run(
        `docker compose -p ${project} exec -T user-db psql -U postgres -d user_db < "${tmp}-user.sql"`,
        { capture: true }
      );
      return true;
    }
    process.stdout.write(`  … schéma pas prêt (${i}/40)\r`);
    await sleep(3000);
  }
  return false;
}

async function provisionDocker(slug) {
  log(`Tenant Docker : ${slug}`);
  const project = `tenant-${slug}`;
  const secrets = tenantSecrets(slug);
  fs.mkdirSync(ENVS_DIR, { recursive: true });
  const envPath = path.join(ENVS_DIR, `${slug}.env`);
  const lines = [
    `TENANT_SLUG=${slug}`,
    'JWT_ACCESS_EXPIRES_IN=15m',
    'JWT_REFRESH_EXPIRES_IN=7d',
    ...Object.entries(secrets).map(([k, v]) => `${k}=${v}`),
    `STRIPE_SECRET_KEY=${envDevValue('STRIPE_SECRET_KEY')}`,
    `STRIPE_WEBHOOK_SECRET=${envDevValue('STRIPE_WEBHOOK_SECRET')}`,
  ];
  fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');

  run(`docker compose -p ${project} --env-file "${envPath}" -f "${TENANT_COMPOSE}" up -d`);

  // Route Traefik
  fs.mkdirSync(DYNAMIC_DIR, { recursive: true });
  const host = `${slug}.${BASE_DOMAIN}`;
  const apiHost = `api.${slug}.${BASE_DOMAIN}`;
  const yml = `http:
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
  fs.writeFileSync(path.join(DYNAMIC_DIR, `${slug}.yml`), yml, 'utf8');
  run('docker restart goosee-traefik', { capture: true });

  // Cible Prometheus
  fs.mkdirSync(TARGETS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(TARGETS_DIR, `${slug}.json`),
    JSON.stringify([{ targets: [`${slug}-gateway:3001`], labels: { tenant: slug, infra: 'docker' } }], null, 2)
  );

  const email = `owner@${slug}.test`;
  const password = rand(9);
  ok('Stack démarrée, seed OWNER en cours…');
  const seeded = await seedOwnerDocker(slug, email, password);
  if (seeded) ok(`OWNER seedé : ${email} / ${password}`);
  else warn('Seed OWNER non confirmé (réessayer plus tard).');

  return { slug, infra: 'docker', url: `http://${host}`, api: `http://${apiHost}`, email, password: seeded ? password : '—' };
}

// ---------------------------------------------------------------- Tenants K8s

async function provisionK8s(slug) {
  log(`Tenant Kubernetes : ${slug}`);
  const secrets = tenantSecrets(slug);
  const password = rand(9);
  const hash = bcrypt.hashSync(password, 12);
  const values = {
    tenant: { slug, domain: BASE_DOMAIN },
    secrets: {
      dbPassword: secrets.DB_PASSWORD,
      jwtSecret: secrets.JWT_SECRET,
      jwtAccessSecret: secrets.JWT_ACCESS_SECRET,
      jwtRefreshSecret: secrets.JWT_REFRESH_SECRET,
      internalApiToken: secrets.INTERNAL_API_TOKEN,
      minioRootUser: secrets.MINIO_ROOT_USER,
      minioRootPassword: secrets.MINIO_ROOT_PASSWORD,
    },
    owner: { email: `owner@${slug}.test`, passwordHash: hash },
  };
  const valuesPath = path.join(os.tmpdir(), `goosee-values-${slug}.yaml`);
  fs.writeFileSync(valuesPath, toYaml(values), 'utf8');
  run(
    `helm upgrade --install ${slug} "${CHART}" -n tenant-${slug} --create-namespace --wait --timeout 6m -f "${valuesPath}"`
  );
  ok(`Déployé (OWNER seedé par le chart) : owner@${slug}.test / ${password}`);
  return {
    slug,
    infra: 'k8s',
    url: `http://${slug}.${BASE_DOMAIN}:${K8S_PORT}`,
    api: `http://api.${slug}.${BASE_DOMAIN}:${K8S_PORT}`,
    email: `owner@${slug}.test`,
    password,
  };
}

// Petit sérialiseur YAML (suffisant pour le fichier de values).
function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  return Object.entries(obj)
    .map(([k, v]) =>
      v && typeof v === 'object'
        ? `${pad}${k}:\n${toYaml(v, indent + 1)}`
        : `${pad}${k}: ${JSON.stringify(v)}`
    )
    .join('\n');
}

// ---------------------------------------------------------------- Teardown

function down() {
  log('Démontage de la présentation');
  run(`docker compose -p tenant-${DOCKER_TENANT} down -v`, { capture: true });
  fs.rmSync(path.join(DYNAMIC_DIR, `${DOCKER_TENANT}.yml`), { force: true });
  fs.rmSync(path.join(TARGETS_DIR, `${DOCKER_TENANT}.json`), { force: true });
  for (const slug of K8S_TENANTS) {
    run(`helm uninstall ${slug} -n tenant-${slug}`, { capture: true });
    run(`kubectl delete namespace tenant-${slug} --ignore-not-found`, { capture: true });
  }
  run(`docker compose -f "${OBS_COMPOSE}" down`, { capture: true });
  run(`docker compose -f "${TRAEFIK_COMPOSE}" down`, { capture: true });
  ok('Tenants et plateforme arrêtés (cluster k3d conservé).');
}

function summary(tenants) {
  console.log('\n\x1b[1m═══════════════════ PRÉSENTATION GOOSEE PRÊTE ═══════════════════\x1b[0m');
  for (const t of tenants) {
    console.log(`\n  \x1b[1m${t.slug}\x1b[0m (${t.infra})`);
    console.log(`    site   : ${t.url}`);
    console.log(`    api    : ${t.api}`);
    console.log(`    owner  : ${t.email} / ${t.password}`);
    console.log(`    admin  : ${t.url}/fr/goosee-admin`);
  }
  console.log('\n  \x1b[1mObservabilité\x1b[0m');
  console.log('    Prometheus : http://localhost:9090');
  console.log('    HPA k8s    : kubectl get hpa -A');
  console.log('    Conso k8s  : kubectl top pods -A');
  console.log('\n  \x1b[1mSuperadmin (vitrine)\x1b[0m : lancer le repo goosee-vitrine (voir son README).');
  console.log('\n  Démontage : yarn presentation:down\n');
}

async function main() {
  if (process.argv.includes('--down')) {
    down();
    return;
  }
  preflight();
  ensureImages();
  ensureCluster();
  ensurePlatform();

  const tenants = [];
  tenants.push(await provisionDocker(DOCKER_TENANT));
  for (const slug of K8S_TENANTS) {
    tenants.push(await provisionK8s(slug));
  }
  summary(tenants);
}

main().catch((err) => {
  console.error(`\n\x1b[31m✗ ${err.message}\x1b[0m`);
  process.exit(1);
});
