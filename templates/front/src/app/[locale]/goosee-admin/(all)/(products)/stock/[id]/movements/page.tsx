'use client';

import { useParams } from 'next/navigation';

import AdminLayout from '@/components/layout/admin/components/layout';
import { StockMovements } from '@/features/stock/components/movements/stock-movements';

export default function Page() {
  const params = useParams<{ id: string }>();

  return (
    <AdminLayout>
      <StockMovements productId={params.id} />
    </AdminLayout>
  );
}
