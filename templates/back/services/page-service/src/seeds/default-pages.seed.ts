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
          content:
            "<p>Vous avez une question ? N'hésitez pas à nous contacter via le formulaire ci-dessous ou par email à contact@votresite.com</p>",
          alignment: 'center',
        },
      },
    ],
  },
];
