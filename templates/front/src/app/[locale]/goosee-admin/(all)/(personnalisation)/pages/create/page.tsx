'use client';

import { PageEditor } from '@/features/personnalisation/pages/components/page-editor/page-editor';
import AdminLayout from '@/components/layout/admin/components/layout';

export default function CreatePagePage() {
  return (
    <AdminLayout>
      <PageEditor />
    </AdminLayout>
  );
}
