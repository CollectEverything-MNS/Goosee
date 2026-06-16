import { Order } from '@/features/orders/data/order.types';

// Donnees de demonstration : commandes affichees sur l'espace client de la
// vitrine. A remplacer par un appel a un futur service de commandes.
export const MY_ORDERS_MOCK: Order[] = [
  {
    id: 'my-ord-001',
    reference: 'CMD-2026-0142',
    customer: { firstName: 'Vous', lastName: '', email: '' },
    status: 'delivered',
    items: [
      { id: 'i-1', productName: 'Cookie chocolat', quantity: 2, unitPrice: 3.5 },
      { id: 'i-2', productName: 'Café latté', quantity: 1, unitPrice: 4.2 },
    ],
    total: 11.2,
    createdAt: '2026-05-12T09:14:00.000Z',
  },
  {
    id: 'my-ord-002',
    reference: 'CMD-2026-0128',
    customer: { firstName: 'Vous', lastName: '', email: '' },
    status: 'preparing',
    items: [
      { id: 'i-1', productName: 'Sandwich poulet', quantity: 1, unitPrice: 7.9 },
      { id: 'i-2', productName: 'Smoothie mangue', quantity: 1, unitPrice: 5.5 },
    ],
    total: 13.4,
    createdAt: '2026-06-02T12:31:00.000Z',
  },
  {
    id: 'my-ord-003',
    reference: 'CMD-2026-0119',
    customer: { firstName: 'Vous', lastName: '', email: '' },
    status: 'cancelled',
    items: [{ id: 'i-1', productName: 'Pizza margherita', quantity: 1, unitPrice: 11.0 }],
    total: 11.0,
    createdAt: '2026-06-10T19:47:00.000Z',
  },
];
