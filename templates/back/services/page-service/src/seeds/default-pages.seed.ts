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
        id: 'contact-main',
        type: 'contact',
        order: 0,
        props: {
          title: 'Contactez-nous',
          subtitle:
            'Une question, une suggestion ? Notre équipe vous répond sous 24h.',
          email: 'contact@votresite.com',
          phone: '01 23 45 67 89',
          address: '123 Rue du Commerce, 57000 Metz',
        },
      },
    ],
  },
];
