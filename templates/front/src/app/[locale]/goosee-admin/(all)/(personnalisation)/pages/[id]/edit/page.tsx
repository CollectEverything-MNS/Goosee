'use client';

import { PageEditor } from '@/features/personnalisation/pages/components/page-editor/page-editor';
import { Page, PageStatus, PageType } from '@/features/personnalisation/pages/types/page.types';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
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
    },
    {
      id: '2',
      type: 'features',
      order: 1,
      props: {
        title: 'Pourquoi nous choisir ?',
        features: [
          { icon: 'truck', title: 'Livraison rapide', description: 'En 24h' },
          { icon: 'shield', title: 'Paiement sécurisé', description: '100% sécurisé' },
          { icon: 'refresh', title: 'Retours gratuits', description: 'Sous 30 jours' },
        ],
        columns: 3,
      },
    },
    {
      id: '3',
      type: 'product-grid',
      order: 2,
      props: {
        title: 'Nos produits populaires',
        columns: 4,
        limit: 8,
        showPrice: true,
      },
    },
  ],
  metaTitle: 'Accueil - Ma Boutique',
  metaDescription: 'Bienvenue sur notre boutique en ligne',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function EditPagePage() {
  const router = useRouter();
  const locale = useLocale();
  const params = useParams();
  const pageId = params.id as string;

  const page = mockPage;

  const handleSave = async (data: Partial<Page>) => {
    router.push(`/${locale}/goosee-admin/pages`);
  };

  return (
    <AdminLayout>
      <PageEditor page={page} onSave={handleSave} />
    </AdminLayout>
  );
}
