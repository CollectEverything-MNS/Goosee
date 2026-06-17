// Smoke-test des 3 scénarios de démo (HTTP). Valide : connexion (superadmin/alice/bob),
// superadmin (liste tenants), Mes sites, catalogue + paiement Stripe RÉEL (clientSecret pi_…),
// stop/start propriétaire & superadmin. À lancer après `yarn presentation`.
const VIT = 'http://localhost:3002';
const ALICE_API = 'http://api.atelier-alice.127.0.0.1.nip.io';
const BOB_K8S_API = 'http://api.mode-bob.127.0.0.1.nip.io:8081';

let pass = 0,
  fail = 0;
const ok = (m) => {
  console.log(`  \x1b[32m✓\x1b[0m ${m}`);
  pass++;
};
const ko = (m) => {
  console.log(`  \x1b[31m✗ ${m}\x1b[0m`);
  fail++;
};
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

const arr = (d, key) => (Array.isArray(d) ? d : (d?.[key] ?? []));

async function main() {
  head('Connexions vitrine');
  const accounts = [
    ['superadmin@goosee.dev', 'Superadmin#2026'],
    ['alice@goosee.dev', 'Demo#2026'],
    ['bob@goosee.dev', 'Demo#2026'],
  ];
  const tokens = {};
  for (const [email, pw] of accounts) {
    const r = await http('POST', VIT, '/auth/login', null, { email, password: pw });
    if (r.ok && r.data.token) {
      ok(`login ${email}`);
      tokens[email] = r.data.token;
    } else ko(`login ${email} -> ${r.status} ${JSON.stringify(r.data).slice(0, 120)}`);
  }

  head('Scénario 2 — Superadmin : supervision');
  const sa = tokens['superadmin@goosee.dev'];
  let tenants = [];
  if (sa) {
    const r = await http('GET', VIT, '/superadmin/tenants', sa);
    tenants = arr(r.data, 'tenants');
    r.ok && tenants.length
      ? ok(`liste tenants (${tenants.length}) : ${tenants.map((t) => `${t.slug}/${t.status}`).join(', ')}`)
      : ko(`GET /superadmin/tenants -> ${r.status}`);
  }

  head('Scénario 1 — Alice : Mes sites');
  const alice = tokens['alice@goosee.dev'];
  if (alice) {
    const r = await http('GET', VIT, '/user/me/projects', alice);
    const projs = arr(r.data, 'projects');
    const aa = projs.find((p) => p.subdomain === 'atelier-alice');
    aa
      ? ok(`Alice possède atelier-alice (${aa.status}, ${aa.infra})`)
      : ko(`atelier-alice absent de Mes sites (${projs.map((p) => p.subdomain).join(',')})`);
  }

  head('Scénario 2 — Bob : multi-sites');
  const bob = tokens['bob@goosee.dev'];
  let bobProjects = [];
  if (bob) {
    const r = await http('GET', VIT, '/user/me/projects', bob);
    bobProjects = arr(r.data, 'projects');
    bobProjects.length >= 5
      ? ok(`Bob possède ${bobProjects.length} sites`)
      : ko(`Bob devrait avoir 5 sites, en a ${bobProjects.length}`);
  }

  // ---- Catalogue + paiement Stripe réel sur chaque site déployé ----
  for (const [label, api] of [
    ['atelier-alice (Docker)', ALICE_API],
    ['mode-bob (K8s)', BOB_K8S_API],
  ]) {
    head(`Catalogue + paiement Stripe — ${label}`);
    const rp = await http('GET', api, '/products');
    const products = arr(rp.data, 'products');
    if (!rp.ok || !products.length) {
      ko(`GET /products -> ${rp.status} (${products.length} produits)`);
      continue;
    }
    ok(`catalogue peuplé (${products.length} produits)`);
    const p = products[0];
    const ro = await http('POST', api, '/orders', null, {
      customerEmail: 'smoke@test.dev',
      items: [
        {
          productId: p.id,
          name: p.name,
          unitPriceCents: p.price ? Math.round(p.price * 100) : (p.priceCents ?? 1000),
          quantity: 1,
        },
      ],
    });
    const order = ro.data.order ?? ro.data;
    if (!ro.ok || !order.id) {
      ko(`POST /orders -> ${ro.status} ${JSON.stringify(ro.data).slice(0, 120)}`);
      continue;
    }
    ok(`commande créée (${order.totalCents ?? '?'} cents)`);
    const rpay = await http('POST', api, '/payments', null, {
      orderId: order.id,
      amountCents: order.totalCents ?? 1000,
    });
    const cs = rpay.data.clientSecret;
    if (!rpay.ok || !cs) ko(`POST /payments -> ${rpay.status} ${JSON.stringify(rpay.data).slice(0, 120)}`);
    else if (cs.startsWith('pi_mock')) ko(`Stripe en MODE MOCK (clientSecret=${cs}) — clé secrète absente !`);
    else if (cs.startsWith('pi_')) ok(`paiement Stripe RÉEL initié (clientSecret ${cs.slice(0, 18)}…)`);
    else ko(`clientSecret inattendu : ${cs.slice(0, 24)}`);
  }

  // ---- Stop / Start propriétaire (mode-bob, déployé) ----
  head('Stop / Start propriétaire (Bob → mode-bob)');
  const modeBob = bobProjects.find((p) => p.subdomain === 'mode-bob');
  if (bob && modeBob) {
    const rs = await http('POST', VIT, `/user/me/projects/${modeBob.id}/stop`, bob);
    (rs.ok && (rs.data.project?.status === 'STOPPED'))
      ? ok('propriétaire : arrêt mode-bob -> STOPPED')
      : ko(`stop -> ${rs.status} ${JSON.stringify(rs.data).slice(0, 120)}`);
    const rstart = await http('POST', VIT, `/user/me/projects/${modeBob.id}/start`, bob);
    (rstart.ok && rstart.data.project?.status === 'ACTIVE')
      ? ok('propriétaire : redémarrage mode-bob -> ACTIVE')
      : ko(`start -> ${rstart.status} ${JSON.stringify(rstart.data).slice(0, 120)}`);
  } else ko('mode-bob introuvable pour le test stop/start');

  // ---- Stop / Start superadmin + pas de fuite du mot de passe OWNER ----
  head('Stop / Start superadmin (+ aucune fuite OWNER)');
  const t = tenants.find((x) => x.slug === 'atelier-alice');
  if (sa && t) {
    const rstop = await http('POST', VIT, `/superadmin/tenants/${t.id}/stop`, sa);
    rstop.ok ? ok('superadmin : arrêt atelier-alice') : ko(`stop -> ${rstop.status}`);
    const rstart = await http('POST', VIT, `/superadmin/tenants/${t.id}/start`, sa);
    if (!rstart.ok) ko(`start -> ${rstart.status}`);
    else if ('ownerPassword' in rstart.data)
      ko('FUITE : le superadmin reçoit le mot de passe OWNER !');
    else ok('superadmin : redémarrage atelier-alice (aucun mot de passe OWNER renvoyé)');
  } else ko('atelier-alice introuvable dans le registre superadmin');

  console.log(`\n\x1b[1m═══ Résultat : ${pass} OK, ${fail} KO ═══\x1b[0m\n`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
