/* eslint-disable no-console */
/**
 * Seed des comptes et sites de démonstration (3 scénarios — voir scenario.md).
 *
 *   node scripts/seed-demo.js
 *
 * Crée dans les bases de la vitrine (conteneur goosee-postgres-dev) :
 *   - les utilisateurs vitrine : superadmin, alice (1 site), bob (5 sites) ;
 *   - leurs Projects (vitrine_db) + les Tenants correspondants (orchestrator_db),
 *     en statut STOPPED (registre). Le déploiement + les données d'un sous-ensemble
 *     est réalisé par `yarn presentation`.
 * Mots de passe en clair (démo) : superadmin Superadmin#2026, autres Demo#2026.
 * Idempotent : ré-exécutable sans doublon.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const bcrypt = require('bcryptjs');

const PG = 'goosee-postgres-dev';
const DOMAIN = process.env.TENANT_BASE_DOMAIN || '127.0.0.1.nip.io';
const K8S_PORT = process.env.K8S_INGRESS_PORT || '8081';
const DEMO_PW = 'Demo#2026';
const SUPERADMIN_PW = 'Superadmin#2026';

const log = (m) => console.log(`\x1b[36m▶ ${m}\x1b[0m`);
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);

function psql(db, sql, capture = false) {
  const tmp = path.join(os.tmpdir(), `goosee-seed-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`);
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    const out = execSync(`docker exec -i ${PG} psql -U postgres -d ${db} -v ON_ERROR_STOP=1 -tA < "${tmp}"`, {
      env: { ...process.env, MSYS_NO_PATHCONV: '1' },
      stdio: capture ? 'pipe' : 'inherit',
      shell: true,
      encoding: 'utf8',
    });
    return (out || '').toString().trim();
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

// Échappe les apostrophes pour les littéraux SQL.
const esc = (s) => String(s).replace(/'/g, "''");

const instanceUrl = (slug, infra) =>
  infra === 'k8s' ? `http://${slug}.${DOMAIN}:${K8S_PORT}` : `http://${slug}.${DOMAIN}`;
const apiUrl = (slug, infra) =>
  infra === 'k8s' ? `http://api.${slug}.${DOMAIN}:${K8S_PORT}` : `http://api.${slug}.${DOMAIN}`;

// Crée/maj un utilisateur vitrine (idempotent par e-mail).
function upsertUser({ email, password, role, firstName, lastName }) {
  const hash = bcrypt.hashSync(password, 12);
  psql(
    'vitrine_db',
    `INSERT INTO users (email, password, role, "firstName", "lastName")
VALUES ('${esc(email)}', '${hash}', '${role}', '${esc(firstName)}', '${esc(lastName)}')
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role,
  "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName";`
  );
}

// Crée/maj un site : tenant (registre) + project (vitrine), en STOPPED.
// userId résolu par sous-requête sur l'e-mail (pas de round-trip d'UUID).
function upsertSite(userEmail, { slug, plan, infra, label }) {
  psql(
    'orchestrator_db',
    `DELETE FROM tenants WHERE slug = '${esc(slug)}';
INSERT INTO tenants (slug, "ownerEmail", plan, infra, status, "instanceUrl", "apiUrl")
VALUES ('${esc(slug)}', '${esc(userEmail)}', '${plan}', '${infra}', 'STOPPED', '${instanceUrl(slug, infra)}', '${apiUrl(slug, infra)}');`
  );
  psql(
    'vitrine_db',
    `DELETE FROM projects WHERE subdomain = '${esc(slug)}';
INSERT INTO projects ("userId", "businessName", subdomain, "domainType", plan, status, infra, "instanceUrl")
VALUES ((SELECT id FROM users WHERE email = '${esc(userEmail)}'), '${esc(label)}', '${esc(slug)}', 'subdomain', '${plan}', 'STOPPED', '${infra}', '${instanceUrl(slug, infra)}');`
  );
}

function main() {
  log('Comptes de démonstration');

  upsertUser({
    email: 'superadmin@goosee.dev',
    password: SUPERADMIN_PW,
    role: 'SUPERADMIN',
    firstName: 'Super',
    lastName: 'Admin',
  });
  ok('superadmin@goosee.dev / ' + SUPERADMIN_PW + ' (SUPERADMIN)');

  upsertUser({
    email: 'alice@goosee.dev',
    password: DEMO_PW,
    role: 'CLIENT',
    firstName: 'Alice',
    lastName: 'Martin',
  });
  upsertSite('alice@goosee.dev', {
    slug: 'atelier-alice',
    plan: 'commerce',
    infra: 'docker',
    label: "L'Atelier d'Alice",
  });
  ok('alice@goosee.dev / ' + DEMO_PW + ' — 1 site Docker (atelier-alice)');

  upsertUser({
    email: 'bob@goosee.dev',
    password: DEMO_PW,
    role: 'CLIENT',
    firstName: 'Bob',
    lastName: 'Durand',
  });
  const bobSites = [
    { slug: 'resto-bob', plan: 'commerce', infra: 'docker', label: 'Resto Bob' },
    { slug: 'mode-bob', plan: 'enterprise', infra: 'k8s', label: 'Mode Bob' },
    { slug: 'tech-bob', plan: 'enterprise', infra: 'k8s', label: 'Tech Bob' },
    { slug: 'deco-bob', plan: 'enterprise', infra: 'k8s', label: 'Deco Bob' },
    { slug: 'sport-bob', plan: 'enterprise', infra: 'k8s', label: 'Sport Bob' },
  ];
  for (const s of bobSites) {
    upsertSite('bob@goosee.dev', s);
  }
  ok('bob@goosee.dev / ' + DEMO_PW + ' — 5 sites (1 Docker + 4 K8s)');

  console.log('\n\x1b[1mComptes prêts.\x1b[0m Charlie (scénario 3) se crée en live via l’onboarding.');
  console.log('Déploiement + données des sites : `yarn presentation`.');
}

main();
