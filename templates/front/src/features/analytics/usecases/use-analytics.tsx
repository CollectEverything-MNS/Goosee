'use client';

import { useMemo } from 'react';

import { ORDER_STATUSES, OrderStatus } from '@/features/orders/data/order.types';
import { useListOrders } from '@/features/orders/usecases/use-list-orders';
import { useListCategories } from '@/features/products/usecases/use-list-categories';
import { useListProducts } from '@/features/products/usecases/use-list-products';
import { useListCustomers } from '@/features/users/usecases/use-list-customers';

import type { DateRange } from '../data/period';

export interface AnalyticsKpis {
  revenue: number;
  orders: number;
  avgBasket: number;
  itemsSold: number;
  customers: number;
  cancellationRate: number;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusSlice {
  status: OrderStatus;
  count: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategorySlice {
  name: string;
  products: number;
}

export interface Analytics {
  kpis: AnalyticsKpis;
  revenueByDay: RevenuePoint[];
  ordersByStatus: StatusSlice[];
  topProducts: TopProduct[];
  productsByCategory: CategorySlice[];
  isLoading: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function useAnalytics(range: DateRange = {}): Analytics {
  const ordersQuery = useListOrders();
  const customers = useListCustomers();
  const products = useListProducts();
  const categories = useListCategories();

  const fromTime = range.from?.getTime();
  const toTime = range.to?.getTime();

  const allOrders = ordersQuery.data;

  return useMemo<Analytics>(() => {
    // Filtre les commandes (réelles, via order-service) sur la plage sélectionnée.
    const orders = (allOrders ?? []).filter((o) => {
      const created = new Date(o.createdAt).getTime();
      if (fromTime !== undefined && created < fromTime) return false;
      if (toTime !== undefined && created > toTime) return false;
      return true;
    });
    // Une commande annulée ne génère pas de chiffre d'affaires.
    const billable = orders.filter((o) => o.status !== 'cancelled');

    const revenue = billable.reduce((sum, o) => sum + o.total, 0);
    const itemsSold = billable.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0,
    );
    const cancelled = orders.length - billable.length;

    const kpis: AnalyticsKpis = {
      revenue: round2(revenue),
      orders: orders.length,
      avgBasket: billable.length ? round2(revenue / billable.length) : 0,
      itemsSold,
      customers: customers.data?.length ?? 0,
      cancellationRate: orders.length
        ? Math.round((cancelled / orders.length) * 100)
        : 0,
    };

    // Chiffre d'affaires par jour (commandes facturables uniquement).
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    for (const o of billable) {
      const day = o.createdAt.slice(0, 10);
      const entry = dayMap.get(day) ?? { revenue: 0, orders: 0 };
      entry.revenue += o.total;
      entry.orders += 1;
      dayMap.set(day, entry);
    }
    const revenueByDay: RevenuePoint[] = [...dayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, revenue: round2(v.revenue), orders: v.orders }));

    // Répartition des commandes par statut (toutes commandes).
    const ordersByStatus: StatusSlice[] = ORDER_STATUSES.map((status) => {
      const list = orders.filter((o) => o.status === status);
      return {
        status,
        count: list.length,
        revenue: round2(list.reduce((s, o) => s + o.total, 0)),
      };
    }).filter((s) => s.count > 0);

    // Meilleures ventes par quantité (commandes facturables).
    const prodMap = new Map<string, { quantity: number; revenue: number }>();
    for (const o of billable) {
      for (const item of o.items) {
        const entry = prodMap.get(item.productName) ?? { quantity: 0, revenue: 0 };
        entry.quantity += item.quantity;
        entry.revenue += item.quantity * item.unitPrice;
        prodMap.set(item.productName, entry);
      }
    }
    const topProducts: TopProduct[] = [...prodMap.entries()]
      .map(([name, v]) => ({ name, quantity: v.quantity, revenue: round2(v.revenue) }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6);

    // Composition du catalogue par catégorie (données réelles).
    const cats = categories.data ?? [];
    const prods = products.data ?? [];
    const productsByCategory: CategorySlice[] = cats
      .map((c: { id: string; name: string }) => ({
        name: c.name,
        products: prods.filter((p: { categoryId?: string }) => p.categoryId === c.id).length,
      }))
      .filter((c) => c.products > 0)
      .sort((a, b) => b.products - a.products);

    return {
      kpis,
      revenueByDay,
      ordersByStatus,
      topProducts,
      productsByCategory,
      isLoading:
        ordersQuery.isLoading ||
        customers.isLoading ||
        products.isLoading ||
        categories.isLoading,
    };
  }, [
    fromTime,
    toTime,
    allOrders,
    ordersQuery.isLoading,
    customers.data,
    customers.isLoading,
    products.data,
    products.isLoading,
    categories.data,
    categories.isLoading,
  ]);
}
