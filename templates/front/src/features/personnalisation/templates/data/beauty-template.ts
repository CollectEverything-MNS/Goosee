import type { TemplateDefinition } from './drive-template';

const COLORS = {
  dark: '#3d2a3f',
  light: '#fdf7f7',
  soft: '#f8ebed',
  accent: '#be185d',
  textDark: '#3d2a3f',
  textLight: '#fdf7f7',
};

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=80',
  heroAbout:
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=2400&q=80',
  hair:
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80',
  facial:
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  nails:
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
  massage:
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
};

export const BEAUTY_TEMPLATE: TemplateDefinition = {
  id: 'salon-beaute',
  name: 'Salon Élégance',
  description:
    "Site doux et raffiné pour salon de beauté, coiffure ou esthétique : héro accueillant, prestations claires, prise de rendez-vous mise en avant. Palette rose poudré et bordeaux.",
  preview: '',
  category: 'beauty',
  accentColor: '#be185d',
  pages: [
    {
      title: 'Accueil',
      slug: 'accueil',
      type: 'home',
      status: 'published',
      metaTitle: 'Prenez du temps pour vous.',
      metaDescription:
        'Salon de beauté : coiffure, soins du visage, ongles, massage. Sur rendez-vous, six jours sur sept.',
      components: [
        {
          id: 'hero-home',
          type: 'hero',
          order: 0,
          props: {
            title: 'Prenez du temps pour vous.',
            subtitle:
              "Coiffure, soins du visage, ongles, massage. Une parenthèse pensée pour vous, chaque détail compte.",
            buttonText: 'Prendre rendez-vous',
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
              { icon: 'star', title: '12 ans', description: 'au service de votre beauté' },
              { icon: 'heart', title: '2 800', description: 'clientes fidèles' },
              { icon: 'leaf', title: 'Bio', description: 'gammes Kérastase & Esthederm' },
              { icon: 'clock', title: '7j/7', description: 'sur rendez-vous' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'services-home',
          type: 'features',
          order: 2,
          props: {
            title: 'Nos univers.',
            columns: 4,
            features: JSON.stringify([
              {
                icon: 'scissors',
                title: 'Coiffure',
                description: 'Coupe, couleur, lissage, balayage. Diagnostic capillaire offert.',
              },
              {
                icon: 'sparkles',
                title: 'Visage',
                description: 'Soins anti-âge, nettoyage profond, lifting naturel.',
              },
              {
                icon: 'heart',
                title: 'Ongles',
                description: 'Manucure, pédicure, semi-permanent, nail art.',
              },
              {
                icon: 'leaf',
                title: 'Massage',
                description: 'Californien, balinais, ayurvédique. 30 à 90 minutes.',
              },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'products-home',
          type: 'featured-products',
          order: 3,
          props: {
            title: 'Les prestations phares.',
            subtitle: 'Une sélection de soins très demandés.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Coupe + brushing', price: '55 €', image: IMAGES.hair, link: '/catalogue' },
              { name: 'Soin éclat 60 min', price: '85 €', image: IMAGES.facial, link: '/catalogue' },
              { name: 'Manucure semi-perm.', price: '45 €', image: IMAGES.nails, link: '/catalogue' },
              { name: 'Massage californien 1h', price: '75 €', image: IMAGES.massage, link: '/catalogue' },
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
              "Sortir d'ici, c'est se sentir un peu plus elle-même. C'est tout ce que je cherche à offrir.",
            author: 'Camille, fondatrice du salon',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'testimonials-home',
          type: 'testimonials',
          order: 5,
          props: {
            title: 'Elles en parlent mieux que nous.',
            testimonials: JSON.stringify([
              {
                name: 'Léa M.',
                text: "Camille a su me conseiller une couleur qui me met vraiment en valeur. Je n'aurais jamais osé seule.",
                rating: 5,
              },
              {
                name: 'Sarah K.',
                text: "Le massage est divin. J'en sors les yeux brillants. Je reviens tous les mois maintenant.",
                rating: 5,
              },
              {
                name: 'Inès T.',
                text: "Ambiance feutrée, équipe douce, café offert. C'est devenu mon rituel du samedi.",
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
            title: 'Réserver votre moment.',
            subtitle: 'Première visite ? Profitez de 15% sur votre première prestation.',
            buttonText: 'Prendre rendez-vous',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
    {
      title: 'Prestations',
      slug: 'catalogue',
      type: 'catalog',
      status: 'published',
      metaTitle: 'Nos prestations.',
      metaDescription: 'Toutes nos prestations beauté : coiffure, soins visage, ongles, massage.',
      components: [
        {
          id: 'hero-catalog',
          type: 'hero',
          order: 0,
          props: {
            title: 'Nos prestations.',
            subtitle: 'Pour vous, pour elle, pour offrir un moment d\'évasion.',
            alignment: 'center',
            overlay: true,
            height: 'md',
            backgroundType: 'image',
            backgroundImage: IMAGES.facial,
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
          },
        },
        {
          id: 'hair-services',
          type: 'featured-products',
          order: 1,
          props: {
            title: 'Coiffure',
            subtitle: 'Coupe, couleur, soins.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Coupe + brushing', price: '55 €', image: IMAGES.hair, link: '#' },
              { name: 'Couleur racines', price: '65 €', image: '', link: '#' },
              { name: 'Balayage complet', price: '120 €', image: '', link: '#' },
              { name: 'Lissage tanin', price: 'dès 180 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'face-services',
          type: 'featured-products',
          order: 2,
          props: {
            title: 'Soins du visage',
            subtitle: 'Diagnostic offert.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Soin éclat 60 min', price: '85 €', image: IMAGES.facial, link: '#' },
              { name: 'Soin anti-âge 75 min', price: '110 €', image: '', link: '#' },
              { name: 'Hydradermie 90 min', price: '135 €', image: '', link: '#' },
              { name: 'Nettoyage profond', price: '70 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'nails-services',
          type: 'featured-products',
          order: 3,
          props: {
            title: 'Ongles & massage',
            subtitle: 'Mains, pieds, corps.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Manucure semi-perm.', price: '45 €', image: IMAGES.nails, link: '#' },
              { name: 'Pédicure SPA', price: '55 €', image: '', link: '#' },
              { name: 'Massage californien 1h', price: '75 €', image: IMAGES.massage, link: '#' },
              { name: 'Massage ayurvédique 1h30', price: '110 €', image: '', link: '#' },
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
            title: 'Offrir un soin ?',
            subtitle: 'Nos cartes cadeaux sont valables un an, sans contrainte.',
            buttonText: 'Découvrir les cartes',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
    {
      title: 'Le salon',
      slug: 'a-propos',
      type: 'custom',
      status: 'published',
      metaTitle: 'Notre salon.',
      metaDescription: 'L\'histoire du salon, l\'équipe, et notre approche de la beauté.',
      components: [
        {
          id: 'hero-about',
          type: 'hero',
          order: 0,
          props: {
            title: 'Le salon.',
            subtitle: 'Un lieu confidentiel, pensé pour vous faire du bien dès la porte poussée.',
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
              "J'ai ouvert le salon en 2012 après douze ans à courir d'un grand groupe à l'autre. J'avais envie d'un lieu calme, où chaque cliente serait écoutée vraiment, où l'on prendrait le temps. Aujourd'hui nous sommes six : trois coiffeuses, deux esthéticiennes, une masseuse. Et l'accueil, toujours, c'est moi.",
            alignment: 'center',
          },
        },
        {
          id: 'features-about',
          type: 'features',
          order: 2,
          props: {
            title: 'Notre approche.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'heart',
                title: 'L\'écoute, toujours',
                description: 'On comprend votre besoin avant de toucher au matériel. Diagnostic systématique.',
              },
              {
                icon: 'leaf',
                title: 'Des marques propres',
                description: 'Kérastase, Esthederm, OPI. Des gammes professionnelles, des actifs sourcés.',
              },
              {
                icon: 'star',
                title: 'Formation continue',
                description: "L'équipe se forme tous les trois mois aux nouvelles techniques.",
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
              "La beauté n'est pas un luxe. C'est un soin qu'on s'accorde, et qu'on mérite.",
            author: '— Camille, fondatrice',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'banner-about',
          type: 'banner',
          order: 4,
          props: {
            title: 'Prendre rendez-vous.',
            subtitle: 'Du mardi au samedi de 9h à 19h, dimanche sur réservation.',
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
    { label: 'Prestations', slug: 'catalogue', order: 1 },
    { label: 'Le salon', slug: 'a-propos', order: 2 },
    { label: 'Prendre RDV', slug: 'contact', order: 3 },
  ],
};
