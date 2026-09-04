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

  const stocksByProductId = useMemo(() => {
    const map: Record<string, (typeof stocks)[number]> = {};
    for (const s of stocks) {
      if (s?.productId) map[s.productId] = s;
    }
    return map;
  }, [stocks]);

  // On part du catalogue produit (la source de vérité), pas des lignes stock-service :
  // un produit sans stock initialisé doit quand même apparaître (à 0) pour pouvoir l'ajuster.
  const rows = useMemo(
    () =>
      products.map((p) => {
        const s = stocksByProductId[p.id];
        return {
          productId: p.id,
          quantity: s?.quantity ?? 0,
          available: s?.available ?? 0,
          product: p,
        };
      }),
    [products, stocksByProductId]
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
