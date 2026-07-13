'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';

import { useProductsColumns } from './components/products/products-columns';
import { ProductsListingToolbar } from './components/products/products-listing-toolbar';
import { ProductDeleteDialog } from './components/products/product-delete-dialog';
import { ProductFormDialog } from './components/products/product-form-dialog';
import ProductsProvider, { useProduct } from './context/products-provider';
import { useListCategories } from './usecases/use-list-categories';
import { useListProducts } from './usecases/use-list-products';
import { useDetailUrlSync } from '@/hooks/use-detail-url-sync';

function ProductsContent() {
  const t = useTranslations();
  const { open, setOpen, currentRow, setCurrentRow } = useProduct();
  const { data: products = [] } = useListProducts();
  const { data: categories = [] } = useListCategories();

  useDetailUrlSync({ items: products, open, currentRow, setCurrentRow, setOpen, dialog: 'edit' });

  const categoriesById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) {
      if (c?.id) map[c.id] = c.name;
    }
    return map;
  }, [categories]);

  const categoryOptions = useMemo(
    () => categories.map((c: any) => ({ value: c.id, label: c.name })),
    [categories]
  );

  const columns = useProductsColumns({ categoriesById });

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.products')}
        subtitle={t('admin.products.count', { count: products.length })}
        actions={
          <Button onClick={() => setOpen('create')} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.products.addNew')}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={products}
        Toolbar={(props) => <ProductsListingToolbar {...props} categories={categoryOptions} />}
      />
      <ProductFormDialog />
      <ProductDeleteDialog />
    </div>
  );
}

export function Products() {
  return (
    <ProductsProvider>
      <ProductsContent />
    </ProductsProvider>
  );
}
