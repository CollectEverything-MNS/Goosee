'use client';

import { PageEditor } from '@/features/personnalisation/pages/components/page-editor/page-editor';
import { Page, PageStatus, PageType } from '@/features/personnalisation/pages/types/page.types';
import AdminLayout from '@/components/layout/admin/components/layout';

// Mock data for now - will be replaced with API call
const mockPage: Page = {
  id: '1',
  title: 'Accueil',
  slug: 'accueil',
  status: PageStatus.PUBLISHED,
  type: PageType.HOME,
  components: [
    {
      id: '1',
      type: 'hero',
      order: 0,
      props: {
        title: 'Bienvenue sur notre boutique',
        subtitle: 'Découvrez nos produits exceptionnels',
        buttonText: 'Voir le catalogue',
        buttonLink: '/catalog',
        alignment: 'center',
      },
    }
  ],
  metaTitle: 'Accueil - Ma Boutique',
  metaDescription: 'Bienvenue sur notre boutique en ligne',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function EditPagePage() {
  return (
    <AdminLayout>
      <PageEditor page={mockPage} />
    </AdminLayout>
  );
}
