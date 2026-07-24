'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { useListProducts } from '@/features/products/usecases/use-list-products';

import { StockAdjustDialog } from './components/stock/stock-adjust-dialog';
import { useStockColumns } from './components/stock/stock-columns';
import { StockListingToolbar } from './components/stock/stock-listing-toolbar';
import StockProvider from './context/stock-provider';
import { useListStocks } from './usecases/use-list-stocks';

function StockContent() {
  const t = useTranslations();
  const { data: stocks = [] } = useListStocks();
  const { data: products = [] } = useListProducts();

  const productsById = useMemo(() => {
    const map: Record<string, any> = {};
    for (const p of products) {
      if (p?.id) map[p.id] = p;
    }
    return map;
  }, [products]);

  const rows = useMemo(
    () => stocks.map((s) => ({ ...s, product: productsById[s.productId] })),
    [stocks, productsById]
  );

  const columns = useStockColumns();

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.stock')}
        subtitle={t('admin.stock.count', { count: rows.length })}
      />
      <DataTable columns={columns} data={rows} Toolbar={StockListingToolbar} />
      <StockAdjustDialog />
    </div>
  );
}

export function Stock() {
  return (
    <StockProvider>
      <StockContent />
    </StockProvider>
  );
}
