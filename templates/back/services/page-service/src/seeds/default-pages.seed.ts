import { Page, PageStatus, PageType } from '../entities/page.entity';

export const DEFAULT_PAGES: Partial<Page>[] = [
  {
    title: 'Accueil',
    slug: 'accueil',
    status: PageStatus.PUBLISHED,
    type: PageType.HOME,
    metaTitle: 'Bienvenue sur notre boutique',
    metaDescription: 'Découvrez notre sélection de produits de qualité',
    components: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        props: {
          title: 'Bienvenue sur notre boutique',
          subtitle: 'Découvrez nos produits exceptionnels',
          backgroundImage: '',
          buttonText: 'Voir le catalogue',
          buttonLink: '/catalog',
          alignment: 'center',
        },
      },
      {
        id: 'features-1',
        type: 'features',
        order: 1,
        props: {
          title: 'Pourquoi nous choisir ?',
          features: [
            { icon: 'truck', title: 'Livraison rapide', description: 'En 24-48h' },
            { icon: 'shield', title: 'Paiement sécurisé', description: '100% sécurisé' },
            { icon: 'refresh', title: 'Retours gratuits', description: 'Sous 30 jours' },
          ],
          columns: 3,
        },
      },
      {
        id: 'products-1',
        type: 'product-grid',
        order: 2,
        props: {
          title: 'Nos produits populaires',
          columns: 4,
          limit: 8,
          category: '',
          showPrice: true,
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        order: 3,
        props: {
          title: 'Prêt à découvrir notre collection ?',
          description: 'Parcourez notre catalogue et trouvez le produit parfait',
          buttonText: 'Voir tous les produits',
          buttonLink: '/catalog',
          variant: 'primary',
        },
      },
    ],
  },
  {
    title: 'Catalogue',
    slug: 'catalogue',
    status: PageStatus.PUBLISHED,
    type: PageType.CATALOG,
    metaTitle: 'Notre catalogue de produits',
    metaDescription: 'Parcourez notre large sélection de produits',
    components: [
      {
        id: 'hero-catalog',
        type: 'hero',
        order: 0,
        props: {
          title: 'Notre Catalogue',
          subtitle: 'Découvrez tous nos produits',
          backgroundImage: '',
          buttonText: '',
          buttonLink: '',
          alignment: 'center',
        },
      },
      {
        id: 'products-catalog',
        type: 'product-grid',
        order: 1,
        props: {
          title: '',
          columns: 4,
          limit: 20,
          category: '',
          showPrice: true,
        },
      },
    ],
  },
  {
    title: 'Contact',
    slug: 'contact',
    status: PageStatus.PUBLISHED,
    type: PageType.CONTACT,
    metaTitle: 'Contactez-nous',
    metaDescription: 'Une question ? Contactez notre équipe',
    components: [
      {
        id: 'hero-contact',
        type: 'hero',
        order: 0,
        props: {
          title: 'Contactez-nous',
          subtitle: 'Notre équipe est là pour vous aider',
          backgroundImage: '',
          buttonText: '',
          buttonLink: '',
          alignment: 'center',
        },
      },
      {
        id: 'text-contact',
        type: 'text',
        order: 1,
        props: {
          content: '<p>Vous avez une question ? N\'hésitez pas à nous contacter via le formulaire ci-dessous ou par email à contact@votresite.com</p>',
          alignment: 'center',
        },
      },
      {
        id: 'form-contact',
        type: 'contact-form',
        order: 2,
        props: {
          title: 'Envoyez-nous un message',
          fields: ['name', 'email', 'phone', 'message'],
          submitText: 'Envoyer',
        },
      },
      {
        id: 'spacer-contact',
        type: 'spacer',
        order: 3,
        props: {
          height: 'lg',
        },
      },
    ],
  },
];
