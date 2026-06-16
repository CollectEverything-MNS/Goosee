'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { CategoriesListingToolbar } from './components/categories/categories-listing-toolbar';
import { useCategoriesColumns } from './components/categories/categories-columns';
import { CategoryDeleteDialog } from './components/categories/category-delete-dialog';
import { CategoryFormDialog } from './components/categories/category-form-dialog';
import CategoriesProvider, { useCategory } from './context/categories-provider';
import { useListCategories } from './usecases/use-list-categories';
import { useListProducts } from './usecases/use-list-products';

function CategoriesContent() {
  const t = useTranslations();
  const { setOpen } = useCategory();
  const { data: categories = [] } = useListCategories();
  const { data: products = [] } = useListProducts();

  const productCountByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products as any[]) {
      if (!p?.categoryId) continue;
      map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
    }
    return map;
  }, [products]);

  const columns = useCategoriesColumns({ productCountByCategory });

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.categories')}
        subtitle={t('admin.categories.count', { count: categories.length })}
        actions={
          <Button onClick={() => setOpen('create')} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.categories.addNew')}
          </Button>
        }
      />
      <DataTable columns={columns} data={categories} Toolbar={CategoriesListingToolbar} />
      <CategoryFormDialog />
      <CategoryDeleteDialog />
    </div>
  );
}

export function Categories() {
  return (
    <CategoriesProvider>
      <CategoriesContent />
    </CategoriesProvider>
  );
}
