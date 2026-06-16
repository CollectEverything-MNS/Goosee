export type TemplateCategory = 'drive' | 'bakery' | 'restaurant' | 'beauty';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: TemplateCategory;
  accentColor: string;
  pages: TemplatePage[];
  menus: TemplateMenu[];
}

export interface TemplatePage {
  title: string;
  slug: string;
  type: 'home' | 'catalog' | 'contact' | 'custom';
  status: 'published';
  metaTitle: string;
  metaDescription: string;
  components: any[];
}

export interface TemplateMenu {
  label: string;
  slug: string;
  order: number;
}

// Palette moderne : noir profond / blanc / accent jaune
const COLORS = {
  dark: '#0a0a0a',
  light: '#ffffff',
  soft: '#f5f5f4',
  accent: '#facc15',
  textDark: '#0a0a0a',
  textLight: '#ffffff',
  textMuted: '#737373',
};

// Images Unsplash — libres de droits, esthétique moderne
const IMAGES = {
  heroHome:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2400&q=80',
  heroCatalog:
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=2400&q=80',
  heroAbout:
    'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=2400&q=80',
  fruits:
    'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  bakery:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  dairy:
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
  drinks:
    'https://images.unsplash.com/photo-1610847499832-918a1c3c6811?auto=format&fit=crop&w=800&q=80',
};

export const DRIVE_TEMPLATE: TemplateDefinition = {
  id: 'drive-classique',
  name: 'Drive Moderne',
  description:
    "Template e-commerce épuré et contemporain : héro impactant, catalogue clair, témoignages et CTA. Parfait pour un Drive ou un commerce de proximité qui veut une vitrine moderne.",
  preview: '',
  category: 'drive',
  accentColor: '#facc15',
  pages: [
    /* ============== HOME ============== */
    {
      title: 'Accueil',
      slug: 'accueil',
      type: 'home',
      status: 'published',
      metaTitle: 'Vos courses, simplement.',
      metaDescription:
        'Commandez en ligne, récupérez en Drive ou faites-vous livrer. Des produits frais sélectionnés avec soin.',
      components: [
        {
          id: 'hero-home',
          type: 'hero',
          order: 0,
          props: {
            title: 'Vos courses, simplement.',
            subtitle:
              'Sélection rigoureuse. Préparation en 2h. Retrait en Drive ou livraison à domicile.',
            buttonText: 'Découvrir le catalogue',
            buttonLink: '/catalogue',
            alignment: 'center',
            overlay: true,
            height: 'xl',
            backgroundType: 'image',
            backgroundImage: IMAGES.heroHome,
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
              { icon: 'package', title: '1 200+', description: 'références en catalogue' },
              { icon: 'clock', title: '2h', description: 'pour préparer votre commande' },
              { icon: 'truck', title: '0€', description: 'de frais dès 60€' },
              { icon: 'heart', title: '98%', description: 'de clients satisfaits' },
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
            title: 'Trois étapes, et c\'est tout.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'shopping-cart',
                title: '01. Choisissez',
                description: 'Parcourez le catalogue et ajoutez vos produits au panier en quelques clics.',
              },
              {
                icon: 'clock',
                title: '02. Réservez un créneau',
                description: 'Retrait en Drive dès 2h, ou livraison à domicile sur le créneau de votre choix.',
              },
              {
                icon: 'package',
                title: '03. Récupérez',
                description: 'Vos courses sont prêtes. En 5 minutes c\'est chargé dans la voiture.',
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
            title: 'Les rayons préférés.',
            subtitle: 'Les catégories les plus commandées cette semaine.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Fruits & Légumes', price: 'Dès 1,99 €', image: IMAGES.fruits, link: '/catalogue' },
              { name: 'Boulangerie', price: 'Dès 0,99 €', image: IMAGES.bakery, link: '/catalogue' },
              { name: 'Produits laitiers', price: 'Dès 1,49 €', image: IMAGES.dairy, link: '/catalogue' },
              { name: 'Boissons', price: 'Dès 0,79 €', image: IMAGES.drinks, link: '/catalogue' },
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
              'Je ne fais plus mes courses autrement. Tout est frais, le service est impeccable, et je gagne plusieurs heures chaque semaine.',
            author: 'Marie D. — cliente depuis 2 ans',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'testimonials-home',
          type: 'testimonials',
          order: 5,
          props: {
            title: 'Ce que disent nos clients.',
            testimonials: JSON.stringify([
              {
                name: 'Thomas R.',
                text: 'Service Drive ultra-efficace. Je commande le matin, je récupère le soir, c\'est plié.',
                rating: 5,
              },
              {
                name: 'Sophie L.',
                text: 'Large choix, prix corrects, et toujours du sourire au point retrait. Bravo.',
                rating: 5,
              },
              {
                name: 'Karim B.',
                text: 'Les produits frais sont vraiment frais. Pas comme dans certaines enseignes.',
                rating: 4,
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
            title: 'Première commande ?',
            subtitle: '10% offerts sur votre premier panier avec le code BIENVENUE.',
            buttonText: 'Commander maintenant',
            buttonLink: '/catalogue',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },

    /* ============== CATALOG ============== */
    {
      title: 'Catalogue',
      slug: 'catalogue',
      type: 'catalog',
      status: 'published',
      metaTitle: 'Le catalogue.',
      metaDescription:
        'Parcourez nos rayons : fruits & légumes, boulangerie, laitiers, boissons. Préparation en 2h.',
      components: [
        {
          id: 'hero-catalog',
          type: 'hero',
          order: 0,
          props: {
            title: 'Le catalogue.',
            subtitle: 'Tout ce qu\'il faut pour la semaine, sélectionné chaque matin.',
            alignment: 'center',
            overlay: true,
            height: 'md',
            backgroundType: 'image',
            backgroundImage: IMAGES.heroCatalog,
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
          },
        },
        {
          id: 'products-catalog-1',
          type: 'featured-products',
          order: 1,
          props: {
            title: 'Fruits & Légumes',
            subtitle: 'De saison, de préférence locaux.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Pommes Gala', price: '2,49 €/kg', image: IMAGES.fruits, link: '#' },
              { name: 'Bananes équitables', price: '1,99 €/kg', image: '', link: '#' },
              { name: 'Tomates grappe', price: '3,49 €/kg', image: '', link: '#' },
              { name: 'Salade batavia', price: '0,99 € pièce', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.light,
          },
        },
        {
          id: 'products-catalog-2',
          type: 'featured-products',
          order: 2,
          props: {
            title: 'Boulangerie & Pâtisserie',
            subtitle: 'Cuit le jour même.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Baguette tradition', price: '1,29 €', image: IMAGES.bakery, link: '#' },
              { name: 'Croissants × 4', price: '3,49 €', image: '', link: '#' },
              { name: 'Pain de campagne', price: '2,99 €', image: '', link: '#' },
              { name: 'Brioche maison', price: '2,49 €', image: '', link: '#' },
            ]),
            textColor: COLORS.textDark,
            backgroundColor: COLORS.soft,
          },
        },
        {
          id: 'products-catalog-3',
          type: 'featured-products',
          order: 3,
          props: {
            title: 'Crémerie & Boissons',
            subtitle: 'Pour bien commencer la journée.',
            columns: 4,
            products: JSON.stringify([
              { name: 'Lait demi-écrémé', price: '1,15 € / L', image: IMAGES.dairy, link: '#' },
              { name: 'Yaourts nature × 8', price: '2,89 €', image: '', link: '#' },
              { name: 'Jus orange pressé', price: '3,99 €', image: IMAGES.drinks, link: '#' },
              { name: 'Eau pétillante × 6', price: '2,49 €', image: '', link: '#' },
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
            title: 'Besoin d\'un coup de main ?',
            subtitle: 'Notre équipe vous répond du lundi au samedi, de 8h à 20h.',
            buttonText: 'Nous contacter',
            buttonLink: '/contact',
            backgroundColor: COLORS.dark,
            textColor: COLORS.textLight,
            alignment: 'center',
          },
        },
      ],
    },

    /* ============== ABOUT ============== */
    {
      title: 'À propos',
      slug: 'a-propos',
      type: 'custom',
      status: 'published',
      metaTitle: 'À propos.',
      metaDescription: 'Notre histoire, nos engagements, et pourquoi des milliers de clients nous font confiance.',
      components: [
        {
          id: 'hero-about',
          type: 'hero',
          order: 0,
          props: {
            title: 'Une autre idée des courses.',
            subtitle: 'Locale, fraîche, sans friction. Voilà ce qu\'on défend depuis le premier jour.',
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
              "Notre Drive est né d'une conviction simple : faire ses courses ne devrait pas être une corvée. On a passé deux ans à sélectionner les producteurs, à tester les flux logistiques, à goûter chaque produit. Pour qu'à chaque commande, vous gagniez du temps sans perdre en qualité.",
            alignment: 'center',
          },
        },
        {
          id: 'features-about',
          type: 'features',
          order: 2,
          props: {
            title: 'Trois engagements, tenus depuis le départ.',
            columns: 3,
            features: JSON.stringify([
              {
                icon: 'leaf',
                title: 'Producteurs locaux',
                description: '70% de nos fruits et légumes viennent de moins de 100 km.',
              },
              {
                icon: 'shield',
                title: 'Prix transparents',
                description: 'Pas d\'opérations « -50% » trompeuses. Le juste prix, toute l\'année.',
              },
              {
                icon: 'heart',
                title: 'Service humain',
                description: 'Une équipe à votre écoute, jamais un bot. On répond en moins d\'une heure.',
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
              'On n\'a pas inventé les courses en ligne. On a juste essayé de les rendre agréables.',
            author: '— L\'équipe fondatrice',
            alignment: 'center',
            color: COLORS.textDark,
          },
        },
        {
          id: 'banner-about',
          type: 'banner',
          order: 4,
          props: {
            title: 'On commence ?',
            subtitle: 'Votre premier panier vous attend, avec 10% en moins.',
            buttonText: 'Voir le catalogue',
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
    { label: 'Catalogue', slug: 'catalogue', order: 1 },
    { label: 'À propos', slug: 'a-propos', order: 2 },
    { label: 'Contact', slug: 'contact', order: 3 },
  ],
};

