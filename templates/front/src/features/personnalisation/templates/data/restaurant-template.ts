import type { TemplateDefinition } from './drive-template';

const COLORS = {
  dark: '#0a0a0a',
  light: '#ffffff',
  soft: '#f5f5f4',
  accent: '#c2410c',
  textDark: '#0a0a0a',
  textLight: '#ffffff',
};

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80',
  heroAbout:
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2400&q=80',
  starter:
    'https://images.unsplash.com/photo-1607330289024-1535c6b4e1c1?auto=format&fit=crop&w=800&q=80',
  main:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  dessert:
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
  wine:
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
};

export const RESTAURANT_TEMPLATE: TemplateDefinition = {
  id: 'restaurant-bistronomie',
  name: 'Restaurant Signature',
  description:
    "Vitrine élégante pour restaurant bistronomique : héro photographique, carte du jour, philosophie du chef, réservation. Ambiance noire chic, accents cuivre.",
  preview: '',
  category: 'restaurant',
  accentColor: '#c2410c',
  pages: [
    {
      title: 'Accueil',
      slug: 'accueil',
      type: 'home',
      status: 'published',
      metaTitle: 'Une cuisine d\'instant.',
      metaDescription:
        'Restaurant de produits frais et de saison, carte changeante au gré du marché. Réservation en ligne.',
      components: [
        {
          id: 'hero-home',
          type: 'hero',
          order: 0,
          props: {
            title: 'Une cuisine d\'instant.',
            subtitle:
              'Du marché à l\'assiette en quelques heures. Une carte courte, qui change quand le produit l\'exige.',
            buttonText: 'Réserver une table',
            buttonLink: '/contact',
            alignment: 'center',
            overlay: true,
            height: 'xl',
            backgroundType: 'image',
            backgroundImage: IMAGES.hero,
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
          },
        },
        {
          id: 'stats-home',
          type: 'features',
          order: 1,
          props: {
            title: '',
            columns: 4,
            features: JSON.stringify([
              { icon: 'leaf', title: '90%', description: 'de produits locaux' },
              { icon: 'clock', title: '< 24h', description: 'du marché à l\'assiette' },
              { icon: 'star', title: '★★★', description: 'sélection Gault & Millau' },
              { icon: 'heart', title: '32', description: 'couverts, pas un de plus' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'how-home',
          type: 'features',
          order: 2,
          props: {
            title: 'La maison, en trois mots.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'leaf',
                title: 'Le produit, d\'abord',
                description: "Marché tous les matins. Si le produit n'est pas au top, il n'est pas dans l'assiette.",
              },
              {
                icon: 'star',
                title: 'Une cuisine sobre',
                description: 'Trois éléments par assiette, jamais quatre. Le geste juste, la cuisson exacte.',
              },
              {
                icon: 'heart',
                title: 'L\'accueil',
                description: 'Trente-deux couverts. Une équipe qui a le temps. Vous n\'êtes jamais un numéro.',
              },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'menu-home',
          type: 'featured-products',
          order: 3,
          props: {
            title: 'La carte du moment.',
            subtitle: 'Renouvelée toutes les deux semaines.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Tartare de daurade', price: '14 €', image: IMAGES.starter, link: '/catalogue' },
              { name: 'Ris de veau, jus court', price: '32 €', image: IMAGES.main, link: '/catalogue' },
              { name: 'Pavlova aux fruits rouges', price: '11 €', image: IMAGES.dessert, link: '/catalogue' },
              { name: 'Carte des vins', price: 'dès 6 €', image: IMAGES.wine, link: '/catalogue' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'quote-home',
          type: 'quote',
          order: 4,
          props: {
            content:
              'On ne cuisine pas pour épater. On cuisine pour partager un instant, simplement.',
            author: 'Lucas Berthier, chef',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'testimonials-home',
          type: 'testimonials',
          order: 5,
          props: {
            title: 'Ce qu\'ils en disent.',
            testimonials: JSON.stringify([
              {
                name: 'Camille T.',
                text: "Un dîner mémorable. Carte courte, exécution parfaite. On reviendra avec mes parents.",
                rating: 5,
              },
              {
                name: 'Pierre-Henri D.',
                text: "Le rapport qualité-prix est rare. Et le service, attentif sans en faire trop.",
                rating: 5,
              },
              {
                name: 'Aurélie M.',
                text: "L'accord mets-vins proposé par le sommelier vaut le détour à lui seul.",
                rating: 5,
              },
            ]),
            backgroundColor: COLORS.soft,
            textColor: COLORS.textDark,
          },
        },
        {
          id: 'banner-home',
          type: 'banner',
          order: 6,
          props: {
            title: 'Réserver une table.',
            subtitle: 'Service du mardi au samedi, midi et soir. 32 couverts uniquement.',
            buttonText: 'Réserver maintenant',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
    {
      title: 'La carte',
      slug: 'catalogue',
      type: 'catalog',
      status: 'published',
      metaTitle: 'La carte.',
      metaDescription: 'Notre carte du moment : entrées, plats, desserts et vins.',
      components: [
        {
          id: 'hero-catalog',
          type: 'hero',
          order: 0,
          props: {
            title: 'La carte.',
            subtitle: 'Sept entrées, sept plats, sept desserts. Pas plus, jamais.',
            alignment: 'center',
            overlay: true,
            height: 'md',
            backgroundType: 'image',
            backgroundImage: IMAGES.main,
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
          },
        },
        {
          id: 'starters',
          type: 'featured-products',
          order: 1,
          props: {
            title: 'Entrées',
            subtitle: '',
            columns: 4,
            products: JSON.stringify([
              { name: 'Tartare de daurade', price: '14 €', image: IMAGES.starter, link: '#' },
              { name: 'Burrata, tomates anciennes', price: '13 €', image: '', link: '#' },
              { name: 'Velouté du marché', price: '11 €', image: '', link: '#' },
              { name: 'Œuf parfait, asperges', price: '12 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'mains',
          type: 'featured-products',
          order: 2,
          props: {
            title: 'Plats',
            subtitle: '',
            columns: 4,
            products: JSON.stringify([
              { name: 'Ris de veau, jus court', price: '32 €', image: IMAGES.main, link: '#' },
              { name: 'Bar de ligne, fenouil', price: '34 €', image: '', link: '#' },
              { name: 'Pluma de cochon ibérique', price: '28 €', image: '', link: '#' },
              { name: 'Risotto du marché (V)', price: '24 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'desserts',
          type: 'featured-products',
          order: 3,
          props: {
            title: 'Desserts',
            subtitle: '',
            columns: 4,
            products: JSON.stringify([
              { name: 'Pavlova aux fruits rouges', price: '11 €', image: IMAGES.dessert, link: '#' },
              { name: 'Soufflé au Grand Marnier', price: '12 €', image: '', link: '#' },
              { name: 'Tarte fine aux pommes', price: '10 €', image: '', link: '#' },
              { name: 'Sélection de fromages', price: '13 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'banner-catalog',
          type: 'banner',
          order: 4,
          props: {
            title: 'Une intolérance, un régime ?',
            subtitle: 'Prévenez-nous à la réservation : nous adaptons la cuisine avec plaisir.',
            buttonText: 'Réserver',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
    {
      title: 'Le chef',
      slug: 'a-propos',
      type: 'custom',
      status: 'published',
      metaTitle: 'Le chef.',
      metaDescription: 'Lucas Berthier, parcours et philosophie.',
      components: [
        {
          id: 'hero-about',
          type: 'hero',
          order: 0,
          props: {
            title: 'Le chef.',
            subtitle: 'Quinze ans dans les cuisines de France et d\'ailleurs. Un retour aux sources, ici.',
            alignment: 'center',
            overlay: true,
            height: 'lg',
            backgroundType: 'image',
            backgroundImage: IMAGES.heroAbout,
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
          },
        },
        {
          id: 'text-about',
          type: 'text',
          order: 1,
          props: {
            content:
              "Lucas a appris la cuisine chez Passard, puis a fait ses armes au Suquet de Bras. Cinq ans passés au Japon, à comprendre la cuisson du poisson, le geste juste, l'épure. Il revient en 2021 pour ouvrir sa maison : un lieu pour lui, fait à sa main, avec sa femme Camille en salle. Pas de carte qui tient l'année. Pas de prétention. Juste l'envie de cuisiner ce qui est bon, quand c'est bon.",
            alignment: 'center',
          },
        },
        {
          id: 'features-about',
          type: 'features',
          order: 2,
          props: {
            title: 'La philosophie.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'leaf',
                title: 'Saisonnalité stricte',
                description: 'Pas de tomate en hiver, pas d\'asperge en novembre. Le calendrier dicte la carte.',
              },
              {
                icon: 'star',
                title: 'Filière courte',
                description: 'Maraîchers, éleveurs, pêcheurs : nos producteurs sont tous à moins de 60 km.',
              },
              {
                icon: 'heart',
                title: 'L\'expérience entière',
                description: 'Une cuisine, une salle, une carte des vins, un service. Tout doit faire sens.',
              },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'quote-about',
          type: 'quote',
          order: 3,
          props: {
            content:
              'La meilleure recette ne vaut rien sans le bon produit. Tout le reste, c\'est de l\'agitation.',
            author: '— Lucas Berthier',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'banner-about',
          type: 'banner',
          order: 4,
          props: {
            title: 'Réserver votre table.',
            subtitle: 'Du mardi au samedi, midi et soir. Confirmation par téléphone.',
            buttonText: 'Réserver',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
  ],
  menus: [
    { label: 'Accueil', slug: 'accueil', order: 0 },
    { label: 'La carte', slug: 'catalogue', order: 1 },
    { label: 'Le chef', slug: 'a-propos', order: 2 },
    { label: 'Réserver', slug: 'contact', order: 3 },
  ],
};
