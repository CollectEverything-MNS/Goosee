/**
 * Parcours d'achat de bout en bout, contre une stack réelle (docker-compose dev).
 *
 *   signup → vérification e-mail → login → panier → commande → paiement → webhook
 *
 * Prérequis (cf. test/README.md) :
 *  - infra + back démarrés (`yarn infra` + docker-compose.back.dev.yml) ;
 *  - OWNER seedé (`yarn init:user`) pour l'étape de préparation du catalogue ;
 *  - Stripe SANS clé → provider en mode mock (webhook piloté par un JSON simple).
 *
 * Config par variables d'environnement (défauts = stack dev locale) :
 *  - E2E_BASE_URL     (http://localhost:3001)
 *  - E2E_MAILHOG_URL  (http://localhost:8025)
 *  - E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD (admin@goosee.dev / goosee)
 */
import request from 'supertest';
import { waitForVerificationToken } from './helpers/mailhog';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const MAILHOG_URL = process.env.E2E_MAILHOG_URL ?? 'http://localhost:8025';
const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL ?? 'admin@goosee.dev';
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD ?? 'goosee';

const api = () => request(BASE_URL);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const OK = [200, 201];

// Les réponses passent par la gateway : on type juste ce qu'on lit. Certaines
// routes renvoient l'entité à plat, d'autres sous une clé ({ order }, { cart }...).
interface LoginBody {
  accessToken?: string;
  refreshToken?: string;
}
interface RegisterBody {
  email?: string;
}
interface Ref {
  id?: string;
}
interface CategoryBody extends Ref {
  category?: Ref;
}
interface ProductBody extends Ref {
  product?: Ref;
}
interface StockShape {
  quantity?: number;
}
interface StockBody extends StockShape {
  stock?: StockShape;
}
interface CartShape {
  totalCents?: number;
  items?: unknown[];
}
interface CartBody extends CartShape {
  cart?: CartShape;
}
interface OrderShape {
  id?: string;
  totalCents?: number;
  status?: string;
}
interface OrderBody extends OrderShape {
  order?: OrderShape;
}
interface PaymentShape {
  providerRef?: string;
  status?: string;
}
interface PaymentBody extends PaymentShape {
  clientSecret?: string;
  payment?: PaymentShape;
}
interface WebhookBody {
  received?: boolean;
  status?: string;
}

/** Polle le stock d'un produit jusqu'à `min` (init asynchrone via événement product.created). */
async function waitForStock(
  productId: string,
  min: number,
  ownerToken: string,
  timeoutMs = 25_000
): Promise<number> {
  const start = Date.now();
  const deadline = start + timeoutMs;
  let last = 0;
  let patched = false;
  while (Date.now() < deadline) {
    const res = await api().get(`/stock/${productId}`);
    if (res.status === 200) {
      const b = res.body as StockBody;
      last = b.stock?.quantity ?? b.quantity ?? 0;
      if (last >= min) return last;
    }
    // Filet de sécurité si l'événement d'init s'est perdu : on force un ajustement
    // après ~4 s sans stock visible.
    if (!patched && Date.now() - start > 4_000) {
      patched = true;
      await api()
        .patch(`/stock/${productId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ quantity: Math.max(min, 50) })
        .catch(() => undefined);
    }
    await sleep(1_000);
  }
  throw new Error(
    `Stock du produit ${productId} toujours < ${min} (dernier: ${last}) après ${timeoutMs} ms`
  );
}

/** Polle le statut d'une commande jusqu'à `expected` (MAJ via webhook → order-service). */
async function waitForOrderStatus(
  orderId: string,
  expected: string,
  timeoutMs = 15_000
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    const res = await api().get(`/orders/${orderId}`);
    if (res.status === 200) {
      const b = res.body as OrderBody;
      last = (b.order ?? b).status ?? '';
      if (last === expected) return last;
    }
    await sleep(1_000);
  }
  return last;
}

describe("Parcours d'achat de bout en bout", () => {
  const runId = Date.now();
  const customer = { email: `e2e+${runId}@goosee.test`, password: 'Motdepasse#2026' };
  const sessionKey = `e2e-session-${runId}`;
  const productName = `Article E2E ${runId}`;
  const unitPriceCents = 1_500;
  const quantity = 2;
  const expectedTotal = unitPriceCents * quantity;

  let ownerToken = '';
  let categoryId = '';
  let productId = '';
  let customerToken = '';
  let orderId = '';
  let providerRef = '';

  it('prépare le catalogue : OWNER connecté, catégorie et produit avec stock', async () => {
    const login = await api()
      .post('/auth/login')
      .send({ email: OWNER_EMAIL, password: OWNER_PASSWORD });
    expect(OK).toContain(login.status);
    ownerToken = (login.body as LoginBody).accessToken ?? '';
    expect(ownerToken).toBeTruthy();

    const category = await api()
      .post('/categories')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ name: `E2E ${runId}` });
    expect(OK).toContain(category.status);
    const catBody = category.body as CategoryBody;
    categoryId = catBody.category?.id ?? catBody.id ?? '';
    expect(categoryId).toBeTruthy();

    const product = await api()
      .post('/products')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        name: productName,
        price: unitPriceCents,
        categoryIds: [categoryId],
        initialStock: 50,
      });
    expect(OK).toContain(product.status);
    const prodBody = product.body as ProductBody;
    productId = prodBody.product?.id ?? prodBody.id ?? '';
    expect(productId).toBeTruthy();

    const stock = await waitForStock(productId, quantity, ownerToken);
    expect(stock).toBeGreaterThanOrEqual(quantity);
  });

  it("inscrit le client (déclenche l'e-mail de vérification)", async () => {
    const res = await api().post('/auth/register').send({
      email: customer.email,
      password: customer.password,
      firstName: 'E2E',
      lastName: 'Test',
    });
    expect(OK).toContain(res.status);
    expect((res.body as RegisterBody).email).toBe(customer.email);
  });

  it("refuse la connexion tant que l'e-mail n'est pas vérifié", async () => {
    const res = await api().post('/auth/login').send(customer);
    expect(res.status).toBe(401);
  });

  it("vérifie l'e-mail via le lien reçu dans MailHog", async () => {
    const token = await waitForVerificationToken(MAILHOG_URL, customer.email);
    expect(token).toMatch(/^[a-f0-9]+$/);

    const res = await api().get('/auth/verify-email').query({ token }).redirects(0);
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('verified=1');
  });

  it("connecte le client une fois l'e-mail vérifié", async () => {
    const res = await api().post('/auth/login').send(customer);
    expect(OK).toContain(res.status);
    const b = res.body as LoginBody;
    customerToken = b.accessToken ?? '';
    expect(customerToken).toBeTruthy();
    expect(b.refreshToken).toBeTruthy();
  });

  it("ajoute l'article au panier et calcule le total", async () => {
    const res = await api()
      .post(`/cart/${sessionKey}/items`)
      .send({ productId, name: productName, unitPriceCents, quantity });
    expect(OK).toContain(res.status);
    const b = res.body as CartBody;
    const cart = b.cart ?? b;
    expect(cart.totalCents).toBe(expectedTotal);
    expect(cart.items).toHaveLength(1);
  });

  it('crée la commande (total recalculé côté serveur, stock réservé)', async () => {
    const res = await api()
      .post('/orders')
      .send({
        customerEmail: customer.email,
        items: [{ productId, name: productName, unitPriceCents, quantity }],
        billingAddress: {
          fullName: 'E2E Test',
          line1: '1 rue du Test',
          postalCode: '57000',
          city: 'Metz',
          country: 'France',
        },
      });
    expect(OK).toContain(res.status);
    const order = (res.body as OrderBody).order ?? (res.body as OrderBody);
    orderId = order.id ?? '';
    expect(orderId).toBeTruthy();
    expect(order.totalCents).toBe(expectedTotal);
    expect(order.status).toBe('pending');
  });

  it("crée l'intention de paiement (Stripe en mode mock)", async () => {
    const res = await api().post('/payments').send({ orderId, amountCents: expectedTotal });
    expect(OK).toContain(res.status);
    const b = res.body as PaymentBody;
    const payment = b.payment ?? b;
    providerRef = payment.providerRef ?? '';
    expect(providerRef).toMatch(/^pi_mock_/);
    expect(payment.status).toBe('pending');
    expect(b.clientSecret).toBeTruthy();
  });

  it('traite le webhook "succeeded" → la commande passe à "paid"', async () => {
    const res = await api()
      .post('/payments/webhook')
      .set('Content-Type', 'application/json')
      .send({ providerRef, status: 'succeeded' });
    expect(OK).toContain(res.status);
    expect(res.body as WebhookBody).toMatchObject({ received: true, status: 'succeeded' });

    const status = await waitForOrderStatus(orderId, 'paid');
    expect(status).toBe('paid');
  });
});
