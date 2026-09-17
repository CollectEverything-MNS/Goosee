/* eslint-disable no-console */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function api(method, base, route, token, body) {
  const response = await fetch(`${base}${route}`, {
    method, signal: AbortSignal.timeout(route === '/assistant/ask' ? 35000 : 10000),
    headers: { 'content-type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${method} ${route}: HTTP ${response.status}`);
  return response.status === 204 ? {} : response.json();
}
async function retry(action, description, attempts = 60) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { return await action(); } catch (error) { last = error; }
    await sleep(3000);
  }
  throw new Error(`${description}: ${last.message}`);
}
async function login(base, email, password) {
  return retry(async () => {
    const result = await api('POST', base, '/auth/login', null, { email, password });
    if (!result.accessToken) throw new Error('accessToken absent');
    return result.accessToken;
  }, 'Connexion propriétaire');
}
async function seedTenantData(base, email, password) {
  const token = await login(base, email, password);
  const categories = await retry(() => api('GET', base, '/categories', token), 'Catalogue prêt');
  let category = categories.categories.find((item) => item.name === 'Boutique démo');
  if (!category) category = (await api('POST', base, '/categories', token, { name: 'Boutique démo' })).category;
  const existing = (await api('GET', base, '/products', token)).products;
  const products = [];
  for (const [name, price] of [['Café signature', 3.5], ['Thé bio', 4.2], ['Cookie maison', 2.8], ['Formule déjeuner', 12.9]]) {
    let product = existing.find((item) => item.name === name);
    if (!product) product = (await api('POST', base, '/products', token, {
      name, price, initialStock: 120, categoryId: category.id,
    })).product;
    await retry(async () => {
      const { stock } = await api('GET', base, `/stock/${product.id}`, token);
      if (stock.available < 5) throw new Error(`Stock de ${name} non prêt ou épuisé`);
    }, 'Stock disponible', 30);
    products.push(product);
  }
  // Les pages par défaut ne contiennent qu'un bandeau ; rendre le catalogue visible.
  const pageResponse = await api('GET', base, '/pages', token);
  const pages = pageResponse.pages ?? pageResponse;
  for (const page of pages.filter((item) => ['home', 'catalog'].includes(item.type))) {
    const components = page.components.map((component) => component.props?.buttonLink === '/catalog'
      ? { ...component, props: { ...component.props, buttonLink: '/catalogue' } } : component);
    if (!components.some((component) => component.type === 'featured-products')) {
      components.push({ id: 'demo-products', type: 'featured-products', order: components.length,
        props: { title: 'Notre sélection', columns: 4, categoryId: category.id, limit: 4 } });
    }
    if (JSON.stringify(components) !== JSON.stringify(page.components)) {
      await api('PUT', base, `/pages/${page.id}`, token, { components });
    }
  }
  // Un e-mail stable par commande permet de reprendre un seed partiellement terminé.
  const orders = (await api('GET', base, '/orders', token)).orders;
  for (let i = 0; i < 3; i++) {
    const customerEmail = `demo-order-${i + 1}@goosee.test`;
    let order = orders.find((item) => item.customerEmail === customerEmail);
    if (!order) order = (await api('POST', base, '/orders', null, {
      customerEmail, items: [{ productId: products[i].id, name: products[i].name,
        unitPriceCents: Math.round(Number(products[i].price) * 100), quantity: 1 }],
    })).order;
    if (order.status === 'pending') {
      const result = await api('POST', base, '/payments', null, { orderId: order.id, amountCents: order.totalCents });
      if (!result.payment.providerRef.startsWith('pi_mock_')) throw new Error('La démo automatique attend le paiement simulé');
      await api('POST', base, '/payments/webhook', null, { providerRef: result.payment.providerRef, status: 'succeeded' });
    }
    const checked = await api('GET', base, `/orders/${order.id}`, token);
    if (checked.order.status !== 'paid') throw new Error('Paiement non propagé à la commande');
  }
  console.log('  Catalogue et stock prêts ; 3 commandes payées par webhook simulé.');
}
module.exports = { api, retry, login, seedTenantData };
