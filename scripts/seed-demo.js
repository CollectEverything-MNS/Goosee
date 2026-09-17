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
// On stocke le nom du propriétaire sur le tenant pour que le démarrage à la demande seede
// l'OWNER avec le bon nom (« Bob Durand » et non « Admin Goosee »).
function upsertSite(owner, { slug, plan, infra, label }) {
  psql(
    'orchestrator_db',
    `INSERT INTO tenants (slug, "ownerEmail", "ownerFirstName", "ownerLastName", plan, infra, status, "instanceUrl", "apiUrl")
VALUES ('${esc(slug)}', '${esc(owner.email)}', '${esc(owner.firstName)}', '${esc(owner.lastName)}', '${plan}', '${infra}', 'STOPPED', '${instanceUrl(slug, infra)}', '${apiUrl(slug, infra)}') ON CONFLICT (slug) DO UPDATE SET "ownerEmail" = EXCLUDED."ownerEmail", "ownerFirstName" = EXCLUDED."ownerFirstName", "ownerLastName" = EXCLUDED."ownerLastName";`
  );
  psql(
    'vitrine_db',
    `INSERT INTO projects ("userId", "businessName", subdomain, "domainType", plan, status, infra, "instanceUrl")
SELECT (SELECT id FROM users WHERE email = '${esc(owner.email)}'), '${esc(label)}', '${esc(slug)}', 'subdomain', '${plan}', 'STOPPED', '${infra}', '${instanceUrl(slug, infra)}' WHERE NOT EXISTS (SELECT 1 FROM projects WHERE subdomain = '${esc(slug)}');`
  );
}

// Tarifs mensuels par forfait (cents).
const PLAN_PRICE = { starter: 1500, commerce: 2900, enterprise: 9900 };

// Crée/maj l'abonnement + quelques factures payées d'un client (module billing de la vitrine).
// Alice/Bob ont déjà des sites : ils sont donc supposés avoir un abonnement actif.
function upsertBilling(email, plan) {
  const price = PLAN_PRICE[plan] ?? 2900;
  const uid = `(SELECT id FROM users WHERE email = '${esc(email)}')`;
  // Idempotent : on repart d'un état propre pour ce client.
  psql(
    'vitrine_db',
    `DELETE FROM invoices WHERE "userId" = ${uid};
DELETE FROM subscriptions WHERE "userId" = ${uid};
INSERT INTO subscriptions ("userId", plan, status, "currentPeriodStart", "currentPeriodEnd", "cardBrand", "cardLast4", "cardExpMonth", "cardExpYear")
VALUES (${uid}, '${plan}', 'active', date_trunc('month', now()), date_trunc('month', now()) + interval '1 month', 'visa', '4242', 12, 2030);
-- 3 dernières factures payées (3 derniers mois)
INSERT INTO invoices ("userId", "amountCents", currency, status, "paidAt", "periodStart", "periodEnd")
SELECT ${uid}, ${price}, 'eur', 'paid',
       date_trunc('month', now()) - (g || ' month')::interval,
       date_trunc('month', now()) - (g || ' month')::interval,
       date_trunc('month', now()) - ((g - 1) || ' month')::interval
FROM generate_series(1, 3) AS g;`
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

  const alice = { email: 'alice@goosee.dev', firstName: 'Alice', lastName: 'Martin' };
  upsertUser({ ...alice, password: DEMO_PW, role: 'CLIENT' });
  upsertSite(alice, {
    slug: 'atelier-alice',
    plan: 'commerce',
    infra: 'docker',
    label: "L'Atelier d'Alice",
  });
  upsertBilling(alice.email, 'commerce');
  ok('alice@goosee.dev / ' + DEMO_PW + ' — 1 site Docker (atelier-alice) + abonnement commerce');

  const bob = { email: 'bob@goosee.dev', firstName: 'Bob', lastName: 'Durand' };
  upsertUser({ ...bob, password: DEMO_PW, role: 'CLIENT' });
  const bobSites = [
    { slug: 'resto-bob', plan: 'commerce', infra: 'docker', label: 'Resto Bob' },
    { slug: 'mode-bob', plan: 'enterprise', infra: 'k8s', label: 'Mode Bob' },
    { slug: 'tech-bob', plan: 'enterprise', infra: 'k8s', label: 'Tech Bob' },
    { slug: 'deco-bob', plan: 'enterprise', infra: 'k8s', label: 'Deco Bob' },
    { slug: 'sport-bob', plan: 'enterprise', infra: 'k8s', label: 'Sport Bob' },
  ];
  for (const s of bobSites) {
    upsertSite(bob, s);
  }
  // Bob a des sites enterprise : abonnement enterprise (forfait le plus élevé qu'il possède).
  upsertBilling(bob.email, 'enterprise');
  ok('bob@goosee.dev / ' + DEMO_PW + ' — 5 sites (1 Docker + 4 K8s) + abonnement enterprise');

  console.log('\n\x1b[1mComptes prêts.\x1b[0m Charlie (scénario 3) se crée en live via l’onboarding.');
  console.log('Déploiement + données des sites : `yarn presentation`.');
}

main();
