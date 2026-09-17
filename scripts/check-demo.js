/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { api, login, retry } = require('./demo-data');
async function checkSite(slug, email, port = '') {
  const host = `${slug}.127.0.0.1.nip.io${port}`;
  const base = `http://api.${host}`;
  const token = await login(base, email, 'Demo#2026');
  for (const route of ['/fr', '/fr/goosee-admin']) {
    const response = await fetch(`http://${host}${route}`, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, `${host}${route}`);
  }
  const { products } = await api('GET', base, '/products', token);
  assert.ok(products.length >= 4, 'Catalogue de démo');
  const { orders } = await api('GET', base, '/orders', token);
  assert.equal(orders.filter((item) => /^demo-order-[123]@goosee.test$/.test(item.customerEmail) && item.status === 'paid').length, 3, 'Trois commandes payées');
  await api('GET', base, '/tickets', token);
  if (process.env.PRESENTATION_ASSISTANT !== '0') {
    const guide = await api('GET', base, '/assistant/guide', token);
    assert.ok(guide.content.length > 100, 'Guide du chatbot embarqué');
    if (process.argv.includes('--chatbot')) {
      const reply = await api('POST', base, '/assistant/ask', token, { question: 'Comment ajouter un produit ? Réponds en trois phrases.' });
      assert.ok(reply.answer?.length > 20, 'Réponse Gemini');
      console.log(`OK ${slug}: chatbot ${reply.model}, réponse reçue`);
    }
  }
  const { stock } = await api('GET', base, `/stock/${products[0].id}`, token);
  assert.ok(stock.available > 0, 'Stock disponible');
  const session = 'demo-smoke-check';
  await api('DELETE', base, `/cart/${session}`, null);
  await api('POST', base, `/cart/${session}/items`, null, {
    productId: products[0].id, name: products[0].name,
    unitPriceCents: Math.round(Number(products[0].price) * 100), quantity: 1,
  });
  const cart = await api('GET', base, `/cart/${session}`, null);
  assert.equal(cart.cart.items.length, 1, 'Panier rempli');
  await api('DELETE', base, `/cart/${session}`, null);
  console.log(`OK ${slug}: front, admin, connexion, catalogue, stock, tickets, panier, commandes payées`);
  return { slug, products: products.map((p) => p.id).sort(), orders: orders.map((o) => o.id).sort() };
}
async function main() {
  const sites = [];
  if (process.env.PRESENTATION_DOCKER_COUNT !== '0') sites.push(await checkSite('atelier-alice', 'alice@goosee.dev'));
  if (process.env.PRESENTATION_K8S_COUNT !== '0') sites.push(await checkSite('mode-bob', 'bob@goosee.dev', ':8081'));
  await retry(async () => {
    const response = await fetch('http://localhost:9090/api/v1/targets', { signal: AbortSignal.timeout(10000) });
    const data = await response.json();
    for (const site of sites) assert.ok(data.data.activeTargets.some((t) => t.labels.tenant === site.slug && t.health === 'up'), `Prometheus ${site.slug}`);
  }, 'Cibles Prometheus disponibles', 20);
  console.log('OK Prometheus : tenants UP');
  const compareIndex = process.argv.indexOf('--compare-snapshot');
  if (compareIndex >= 0) {
    const before = JSON.parse(fs.readFileSync(process.argv[compareIndex + 1], 'utf8'));
    assert.deepEqual(sites, before, 'Produits et commandes conservés sans doublon');
    console.log('OK persistance : mêmes produits et commandes, aucun doublon');
  }
  if (process.argv.includes('--snapshot')) console.log(JSON.stringify(sites));
}
if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { checkSite };
