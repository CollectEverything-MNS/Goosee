'use client';

import AdminLayout from '@/components/layout/layout';
import { PageEditor } from '@/features/personnalisation/pages/components/page-editor/page-editor';
import { Page } from '@/features/personnalisation/pages/types/page.types';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function CreatePagePage() {
  const router = useRouter();
  const locale = useLocale();

  const handleSave = async (data: Partial<Page>) => {
    // TODO: Call API to create page
    console.log('Creating page:', data);

    // Redirect to pages list after creation
    router.push(`/${locale}/goosee-admin/pages`);
  };

  return (
    <AdminLayout>
      <PageEditor onSave={handleSave} />
    </AdminLayout>
  );
}
