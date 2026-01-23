'use client';

import { use } from 'react';
import { PageEditor } from '@/features/personnalisation/pages/components/page-editor/page-editor';
import AdminLayout from '@/components/layout/admin/components/layout';
import { Loader2 } from 'lucide-react';
import { usePage } from '@/features/personnalisation/pages/usecases/get-page-by-id/use-get-page-by-id';
import { LoaderError } from '@/components/ux/loader-error';

interface EditPagePageProps {
  params: Promise<{ id: string }>;
}

export default function EditPagePage({ params }: EditPagePageProps) {
  const { id } = use(params);
  const { data: page, isLoading, error } = usePage(id);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return <LoaderError message={error.message} />;
  }

  return (
    <AdminLayout>
      <PageEditor page={page} />
    </AdminLayout>
  );
}
