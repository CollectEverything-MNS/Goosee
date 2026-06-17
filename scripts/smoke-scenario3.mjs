// Scénario 3 — nouveau client en live : inscription, provisioning du site via l'orchestrateur,
// vérif injection Stripe (chemin control plane) + paiement réel. À lancer après yarn presentation.
import fs from 'fs';
import path from 'path';

const VIT = 'http://localhost:3002';
const SLUG = `charlie-${Math.random().toString(36).slice(2, 6)}`;
const EMAIL = `charlie-${SLUG}@goosee.dev`;
const PW = 'Demo#2026';
const ENVS = 'C:/Users/Flore/Documents/GitHub/Goosee/docker/tenant/envs';

let pass = 0,
  fail = 0;
const ok = (m) => (console.log(`  \x1b[32m✓\x1b[0m ${m}`), pass++);
const ko = (m) => (console.log(`  \x1b[31m✗ ${m}\x1b[0m`), fail++);
const head = (m) => console.log(`\n\x1b[36m▶ ${m}\x1b[0m`);

async function http(method, base, route, token, body) {
  const res = await fetch(`${base}${route}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  let data;
  try {
    data = txt ? JSON.parse(txt) : {};
  } catch {
    data = { raw: txt };
  }
  return { status: res.status, ok: res.ok, data };
}
const arr = (d, k) => (Array.isArray(d) ? d : (d?.[k] ?? []));

async function main() {
  head(`Scénario 3 — inscription ${EMAIL}`);
  const reg = await http('POST', VIT, '/auth/register', null, {
    firstName: 'Charlie',
    lastName: 'Live',
    email: EMAIL,
    password: PW,
  });
  reg.ok ? ok('compte créé') : ko(`register -> ${reg.status} ${JSON.stringify(reg.data).slice(0, 120)}`);

  const log = await http('POST', VIT, '/auth/login', null, { email: EMAIL, password: PW });
  const token = log.data.token;
  token ? ok('connexion') : ko(`login -> ${log.status}`);
  if (!token) return finish();

  head(`Provisioning du site ${SLUG} (Docker, via orchestrateur — peut prendre ~1-2 min)`);
  const prov = await http('POST', VIT, '/user/me/project/provision', token, {
    slug: SLUG,
    plan: 'starter',
  });
  const project = prov.data.project;
  if (!prov.ok || !project) {
    ko(`provision -> ${prov.status} ${JSON.stringify(prov.data).slice(0, 160)}`);
    return finish();
  }
  project.status === 'ACTIVE'
    ? ok(`site provisionné (status ${project.status}, ${project.instanceUrl})`)
    : ko(`status attendu ACTIVE, reçu ${project.status}`);
  prov.data.ownerPassword
    ? ok(`mot de passe OWNER renvoyé au client (${prov.data.ownerPassword})`)
    : ko('aucun mot de passe OWNER renvoyé');

  head('Injection Stripe par le control plane (env généré)');
  const envFile = path.join(ENVS, `${SLUG}.env`);
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    /^STRIPE_SECRET_KEY=sk_test_/m.test(content)
      ? ok('STRIPE_SECRET_KEY injecté dans l’env du tenant')
      : ko(`STRIPE_SECRET_KEY absent/vide dans ${SLUG}.env`);
  } else ko(`env ${SLUG}.env introuvable`);

  head('Mes sites du nouveau client');
  const mine = await http('GET', VIT, '/user/me/projects', token);
  const ps = arr(mine.data, 'projects');
  ps.find((p) => p.subdomain === SLUG)
    ? ok('le nouveau site apparaît dans « Mes sites »')
    : ko('site absent de Mes sites');

  head('Paiement Stripe réel sur le nouveau site');
  const api = project.instanceUrl.replace('://', '://api.');
  // attendre que la gateway réponde (services qui finissent de démarrer)
  let products = [];
  for (let i = 0; i < 20; i++) {
    const rp = await http('GET', api, '/products');
    products = arr(rp.data, 'products');
    if (rp.ok && products.length) break;
    await new Promise((r) => setTimeout(r, 3000));
  }
  if (!products.length) {
    ko('catalogue vide/injoignable sur le nouveau site');
    return finish();
  }
  ok(`catalogue accessible (${products.length} produits)`);
  const p = products[0];
  const ro = await http('POST', api, '/orders', null, {
    customerEmail: 'smoke3@test.dev',
    items: [{ productId: p.id, name: p.name, unitPriceCents: Math.round((p.price ?? 10) * 100), quantity: 1 }],
  });
  const order = ro.data.order ?? ro.data;
  if (!order?.id) {
    ko(`POST /orders -> ${ro.status}`);
    return finish();
  }
  const rpay = await http('POST', api, '/payments', null, {
    orderId: order.id,
    amountCents: order.totalCents ?? 1000,
  });
  const cs = rpay.data.clientSecret;
  if (cs?.startsWith('pi_') && !cs.startsWith('pi_mock'))
    ok(`paiement Stripe RÉEL sur le site live (clientSecret ${cs.slice(0, 18)}…)`);
  else ko(`paiement Stripe KO : ${cs}`);

  finish();
}

function finish() {
  console.log(`\n\x1b[1m═══ Scénario 3 : ${pass} OK, ${fail} KO ═══\x1b[0m`);
  console.log(`(site de test : ${SLUG} — nettoyé via yarn presentation:down ou docker compose -p tenant-${SLUG} down -v)\n`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
