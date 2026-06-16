import type { TemplateDefinition } from './drive-template';

const COLORS = {
  dark: '#1c1410',
  light: '#fbf7f1',
  soft: '#f3ead9',
  accent: '#b45309',
  textDark: '#1c1410',
  textLight: '#fbf7f1',
};

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=2400&q=80',
  heroAbout:
    'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=2400&q=80',
  bread:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  croissant:
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
  pastry:
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
  baguette:
    'https://images.unsplash.com/photo-1568471173242-461f0a730452?auto=format&fit=crop&w=800&q=80',
};

export const BAKERY_TEMPLATE: TemplateDefinition = {
  id: 'boulangerie-artisan',
  name: 'Boulangerie Artisan',
  description:
    "Une vitrine chaleureuse pour boulangerie-pâtisserie artisanale : héro gourmand, mise en avant des produits du jour, savoir-faire et témoignages clients.",
  preview: '',
  category: 'bakery',
  accentColor: '#b45309',
  pages: [
    {
      title: 'Accueil',
      slug: 'accueil',
      type: 'home',
      status: 'published',
      metaTitle: 'Le pain, comme avant.',
      metaDescription:
        "Boulangerie artisanale : pétrissage long, levain naturel, cuit chaque matin dans notre four à sole.",
      components: [
        {
          id: 'hero-home',
          type: 'hero',
          order: 0,
          props: {
            title: 'Le bon pain, comme avant.',
            subtitle:
              'Levain naturel, pétrissage lent, cuisson au four à sole. Tout est fait chez nous, chaque matin.',
            buttonText: 'Voir nos pains',
            buttonLink: '/catalogue',
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
              { icon: 'clock', title: '4h', description: 'de pétrissage par fournée' },
              { icon: 'leaf', title: '100%', description: 'levain naturel maison' },
              { icon: 'shield', title: '0', description: 'additif, jamais' },
              { icon: 'heart', title: '1928', description: 'fondée par le grand-père' },
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
            title: 'Notre savoir-faire.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'leaf',
                title: 'Farines paysannes',
                description: "Blé, seigle, petit-épeautre : nos meuniers travaillent sur pierre, à moins de 80 km.",
              },
              {
                icon: 'clock',
                title: 'Le temps qu\'il faut',
                description: 'Fermentation longue, 18h minimum. Les saveurs s\'expriment, le pain se conserve mieux.',
              },
              {
                icon: 'shield',
                title: 'Cuit au four à sole',
                description: 'Sole en pierre, chaleur tournante naturelle. La croûte croustille, la mie respire.',
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
            title: 'À la boutique cette semaine.',
            subtitle: 'Les classiques, et quelques surprises.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Tradition française', price: '1,30 €', image: IMAGES.baguette, link: '/catalogue' },
              { name: 'Pain de campagne', price: '4,80 €', image: IMAGES.bread, link: '/catalogue' },
              { name: 'Croissant pur beurre', price: '1,40 €', image: IMAGES.croissant, link: '/catalogue' },
              { name: 'Tarte du jour', price: '4,50 €', image: IMAGES.pastry, link: '/catalogue' },
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
              "Je viens chercher mon pain ici depuis vingt ans. Il a un goût qu'on ne trouve plus nulle part.",
            author: 'Bernadette M., voisine de toujours',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'testimonials-home',
          type: 'testimonials',
          order: 5,
          props: {
            title: 'Ils nous suivent depuis longtemps.',
            testimonials: JSON.stringify([
              {
                name: 'Élise R.',
                text: "Les croissants du dimanche, c'est un rituel familial. Mes enfants ne voudraient rien d'autre.",
                rating: 5,
              },
              {
                name: 'Mathieu P.',
                text: "Le pain au levain se garde quatre jours sans rien perdre. Goûteux, croustillant, parfait.",
                rating: 5,
              },
              {
                name: 'Claire B.',
                text: "L'éclair café est mon péché mignon. J'en commande trois à chaque fois.",
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
            title: 'Une commande spéciale ?',
            subtitle: 'Anniversaire, baptême, mariage : nous préparons votre pièce sur mesure.',
            buttonText: 'Nous contacter',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
    {
      title: 'Catalogue',
      slug: 'catalogue',
      type: 'catalog',
      status: 'published',
      metaTitle: 'Nos produits.',
      metaDescription: 'Pains, viennoiseries, pâtisseries et gourmandises faites maison.',
      components: [
        {
          id: 'hero-catalog',
          type: 'hero',
          order: 0,
          props: {
            title: 'La carte.',
            subtitle: 'Tout est fait sur place, du matin au soir.',
            alignment: 'center',
            overlay: true,
            height: 'md',
            backgroundType: 'image',
            backgroundImage: IMAGES.bread,
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
          },
        },
        {
          id: 'products-bread',
          type: 'featured-products',
          order: 1,
          props: {
            title: 'Les pains',
            subtitle: 'Levain, levure, tradition.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Tradition française', price: '1,30 €', image: IMAGES.baguette, link: '#' },
              { name: 'Pain de campagne', price: '4,80 €', image: IMAGES.bread, link: '#' },
              { name: 'Seigle aux noix', price: '5,20 €', image: '', link: '#' },
              { name: 'Petit-épeautre', price: '5,90 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'products-viennoiseries',
          type: 'featured-products',
          order: 2,
          props: {
            title: 'Les viennoiseries',
            subtitle: 'Pur beurre, feuilletées chez nous.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Croissant', price: '1,40 €', image: IMAGES.croissant, link: '#' },
              { name: 'Pain au chocolat', price: '1,50 €', image: '', link: '#' },
              { name: 'Chausson aux pommes', price: '2,20 €', image: '', link: '#' },
              { name: 'Brioche feuilletée', price: '4,80 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'products-pastry',
          type: 'featured-products',
          order: 3,
          props: {
            title: 'Pâtisseries',
            subtitle: 'Les classiques, revisités.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Éclair café', price: '3,80 €', image: IMAGES.pastry, link: '#' },
              { name: 'Tarte aux fruits', price: '4,50 €', image: '', link: '#' },
              { name: 'Paris-Brest', price: '4,90 €', image: '', link: '#' },
              { name: 'Mille-feuille', price: '4,20 €', image: '', link: '#' },
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
            title: 'Une question sur un produit ?',
            subtitle: 'Passez nous voir, ou appelez-nous : on a toujours le temps de discuter.',
            buttonText: 'Nous contacter',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },
    {
      title: 'À propos',
      slug: 'a-propos',
      type: 'custom',
      status: 'published',
      metaTitle: 'Notre histoire.',
      metaDescription: 'Trois générations de boulangers, un seul mot d\'ordre : faire bon, faire bien.',
      components: [
        {
          id: 'hero-about',
          type: 'hero',
          order: 0,
          props: {
            title: 'Trois générations, un même four.',
            subtitle: 'Notre histoire commence en 1928, derrière le comptoir de la rue des Tilleuls.',
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
              "Mon grand-père a ouvert la boulangerie en 1928. Mon père l'a reprise en 1972. Je l'ai reprise en 2004. À chaque génération, on garde l'essentiel : le levain qu'on entretient depuis cent ans, le four à sole d'origine, et l'envie de bien faire. On a changé les murs, jamais les recettes.",
            alignment: 'center',
          },
        },
        {
          id: 'features-about',
          type: 'features',
          order: 2,
          props: {
            title: 'Nos principes.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'leaf',
                title: 'Matières nobles',
                description: 'Farine de meunier, beurre AOP, sucre roux non raffiné, œufs fermiers.',
              },
              {
                icon: 'clock',
                title: 'Le temps long',
                description: 'Pas de raccourci. Pétrissage doux, fermentations lentes, cuisson maîtrisée.',
              },
              {
                icon: 'heart',
                title: 'L\'amour du métier',
                description: "Cinq boulangers, trois pâtissiers, une équipe qui se lève à 3h chaque matin.",
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
              'Faire du bon pain, c\'est respecter trois choses : la farine, le temps, et celui qui va le manger.',
            author: '— Antoine, le boulanger',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'banner-about',
          type: 'banner',
          order: 4,
          props: {
            title: 'On vous attend.',
            subtitle: 'Ouvert du mardi au dimanche, de 6h30 à 19h30.',
            buttonText: 'Voir nos produits',
            buttonLink: '/catalogue',
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
    { label: 'Notre histoire', slug: 'a-propos', order: 2 },
    { label: 'Contact', slug: 'contact', order: 3 },
  ],
};
