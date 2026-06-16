'use client';

import { useListAdmins } from '@/features/users/usecases/use-list-admins';
import { useListCustomers } from '@/features/users/usecases/use-list-customers';
import { useListProducts } from '@/features/products/usecases/use-list-products';
import { useListCategories } from '@/features/products/usecases/use-list-categories';

export interface DashboardStat {
  key: 'admins' | 'customers' | 'products' | 'categories';
  value: number;
  isLoading: boolean;
}

export function useDashboardStats(): DashboardStat[] {
  const admins = useListAdmins();
  const customers = useListCustomers();
  const products = useListProducts();
  const categories = useListCategories();

  return [
    { key: 'admins', value: admins.data?.length ?? 0, isLoading: admins.isLoading },
    { key: 'customers', value: customers.data?.length ?? 0, isLoading: customers.isLoading },
    { key: 'products', value: products.data?.length ?? 0, isLoading: products.isLoading },
    { key: 'categories', value: categories.data?.length ?? 0, isLoading: categories.isLoading },
  ];
}
