/* eslint-disable no-console */
/**
 * Entrypoint de provisioning « unattended » d'un tenant.
 *
 * Lancé par l'orchestrateur juste après `docker compose up` d'un tenant :
 *   1. seed l'utilisateur OWNER (réutilise scripts/init-user.js) avec un mot de
 *      passe généré (ou fourni), en réessayant tant que les bases et le schéma
 *      ne sont pas prêts — le schéma est créé au démarrage par migrationsRun ;
 *   2. notifie l'orchestrateur via un callback HTTP : statut, URL du tenant et
 *      identifiants owner.
 *
 * Variables :
 *   INIT_USER_EMAIL          e-mail de l'owner (défaut admin@goosee.dev)
 *   INIT_USER_PASSWORD       mot de passe owner (généré si absent)
 *   PROVISION_TENANT_URL     URL publique du tenant (ex. https://slug.anaduck.fr)
 *   PROVISION_CALLBACK_URL   endpoint de l'orchestrateur à notifier (optionnel)
 *   INTERNAL_API_TOKEN       jeton ajouté au header du callback (optionnel)
 *   AUTH_DB_* / USER_DB_*    accès aux bases (consommés par init-user.js)
 */
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const http = require('http');
const https = require('https');

const EMAIL = process.env.INIT_USER_EMAIL || 'admin@goosee.dev';
const PASSWORD = process.env.INIT_USER_PASSWORD || crypto.randomBytes(18).toString('base64url');
const TENANT_URL = process.env.PROVISION_TENANT_URL || '';
const CALLBACK_URL = process.env.PROVISION_CALLBACK_URL || '';
const TOKEN = process.env.INTERNAL_API_TOKEN || '';
const MAX_ATTEMPTS = Number(process.env.PROVISION_MAX_ATTEMPTS || 30);
const DELAY_MS = Number(process.env.PROVISION_RETRY_DELAY_MS || 2000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function seedOwner() {
  const result = spawnSync('node', [path.join(__dirname, 'init-user.js')], {
    env: { ...process.env, INIT_USER_EMAIL: EMAIL, INIT_USER_PASSWORD: PASSWORD },
    encoding: 'utf8',
  });
  return { ok: result.status === 0, output: `${result.stdout || ''}${result.stderr || ''}` };
}

function postCallback(payload) {
  if (!CALLBACK_URL) {
    console.log('ℹ️  PROVISION_CALLBACK_URL non défini : callback ignoré.');
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const url = new URL(CALLBACK_URL);
    const lib = url.protocol === 'https:' ? https : http;
    const body = JSON.stringify(payload);
    const req = lib.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...(TOKEN ? { 'x-internal-token': TOKEN } : {}),
        },
      },
      (res) => {
        res.resume();
        console.log(`→ Callback ${CALLBACK_URL} : HTTP ${res.statusCode}`);
        resolve();
      }
    );
    req.on('error', (err) => {
      console.error(`⚠️  Callback en échec : ${err.message}`);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("→ Provisioning : seed de l'utilisateur OWNER...");
  let lastOutput = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const { ok, output } = seedOwner();
    lastOutput = output;
    if (ok) {
      console.log('✅ Seed owner réussi.');
      await postCallback({
        status: 'ACTIVE',
        url: TENANT_URL,
        owner: { email: EMAIL, password: PASSWORD },
      });
      console.log(`   URL      : ${TENANT_URL || '(non définie)'}`);
      console.log(`   email    : ${EMAIL}`);
      console.log(`   password : ${PASSWORD}`);
      return;
    }
    console.log(`   tentative ${attempt}/${MAX_ATTEMPTS} échouée, nouvel essai dans ${DELAY_MS / 1000}s...`);
    await sleep(DELAY_MS);
  }
  console.error('❌ Provisioning échoué après plusieurs tentatives.');
  console.error(lastOutput);
  await postCallback({ status: 'FAILED', url: TENANT_URL, error: 'seed owner impossible' });
  process.exit(1);
}

main();
