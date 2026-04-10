export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;
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

export const DRIVE_TEMPLATE: TemplateDefinition = {
  id: 'drive-classique',
  name: 'Drive Classique',
  description: 'Template complet pour un site Drive avec page d\'accueil, catalogue produits, page à propos et contact.',
  preview: '',
  pages: [
    {
      title: 'Accueil',
      slug: 'accueil',
      type: 'home',
      status: 'published',
      metaTitle: 'Bienvenue sur votre Drive',
      metaDescription: 'Faites vos courses en ligne et récupérez-les en Drive',
      components: [
        {
          id: 'hero-home',
          type: 'hero',
          order: 0,
          props: {
            title: 'Vos courses en ligne, prêtes en 2h',
            height: 'xl',
            overlay: true,
            subtitle: 'Commandez depuis chez vous et récupérez vos courses en Drive ou faites-vous livrer',
            alignment: 'center',
            textColor: '#ffffff',
            buttonLink: '/catalogue',
            buttonText: 'Voir les produits',
            backgroundType: 'image',
            backgroundColor: '#16a34a',
            backgroundImage: 'https://cdn-s-www.republicain-lorrain.fr/images/D29C25F2-D7A3-4136-AA75-841B20298B64/NW_raw/l-office-de-tourisme-propose-de-decouvrir-le-leclerc-drive-de-fameck-qui-emploie-une-quarantaine-de-personnes-photo-raphael-porte-1498046591.jpg',
          },
        },
        {
          id: 'features-home',
          type: 'features',
          order: 1,
          props: {
            title: 'Comment ça marche ?',
            columns: 4,
            features: JSON.stringify([
              { icon: 'zap', title: '1. Commandez', description: 'Remplissez votre panier en quelques clics' },
              { icon: 'clock', title: '2. Choisissez un créneau', description: 'Retrait Drive ou livraison' },
              { icon: 'truck', title: '3. Récupérez', description: 'Vos courses sont prêtes' },
              { icon: 'heart', title: '4. Profitez', description: 'Qualité garantie à chaque commande' },
            ]),
            textColor: '#000000',
            backgroundColor: '#ffffff',
          },
        },
        {
          id: 'products-home',
          type: 'featured-products',
          order: 2,
          props: {
            title: 'Nos produits populaires',
            subtitle: 'Les plus commandés cette semaine',
            columns: 4,
            products: JSON.stringify([
              { name: 'Fruits & Légumes', price: 'Dès 1,99 €', image: '', link: '/catalogue' },
              { name: 'Boulangerie', price: 'Dès 0,99 €', image: '', link: '/catalogue' },
              { name: 'Produits laitiers', price: 'Dès 1,49 €', image: '', link: '/catalogue' },
              { name: 'Boissons', price: 'Dès 0,79 €', image: '', link: '/catalogue' },
            ]),
            textColor: '#000000',
            backgroundColor: '#f9fafb',
          },
        },
        {
          id: 'banner-home',
          type: 'banner',
          order: 3,
          props: {
            title: 'Première commande ?',
            subtitle: '-10% avec le code BIENVENUE sur votre premier Drive',
            buttonText: 'Commander maintenant',
            buttonLink: '/catalogue',
            backgroundColor: '#111827',
            textColor: '#ffffff',
            alignment: 'center',
          },
        },
        {
          id: 'testimonials-home',
          type: 'testimonials',
          order: 4,
          props: {
            title: 'Ils nous font confiance',
            testimonials: JSON.stringify([
              { name: 'Marie D.', text: 'Super pratique, je gagne un temps fou ! Les produits sont toujours frais.', rating: 5 },
              { name: 'Thomas R.', text: 'Le retrait en Drive est rapide. En 5 minutes c\'est chargé dans la voiture.', rating: 5 },
              { name: 'Sophie L.', text: 'Large choix et prix corrects. Je ne fais plus mes courses autrement.', rating: 4 },
            ]),
            backgroundColor: '#ffffff',
            textColor: '#000000',
          },
        },
      ],
    },
    {
      title: 'Catalogue',
      slug: 'catalogue',
      type: 'catalog',
      status: 'published',
      metaTitle: 'Nos produits',
      metaDescription: 'Parcourez notre sélection de produits frais et de qualité',
      components: [
        {
          id: 'hero-catalog',
          type: 'hero',
          order: 0,
          props: {
            title: 'Nos produits',
            height: 'md',
            subtitle: 'Parcourez nos rayons et remplissez votre panier',
            alignment: 'center',
            textColor: '#ffffff',
            backgroundType: 'image',
            backgroundColor: '#16a34a',
            backgroundImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTibbvcWmiciQnSczFXLo6giHfeoPFsJ075dA&s',
          },
        },
        {
          id: 'products-catalog',
          type: 'featured-products',
          order: 1,
          props: {
            title: 'Fruits & Légumes',
            subtitle: '',
            columns: 4,
            products: JSON.stringify([
              { name: 'Pommes', price: '2,49 €/kg', image: '', link: '#' },
              { name: 'Bananes', price: '1,99 €/kg', image: '', link: '#' },
              { name: 'Tomates', price: '3,49 €/kg', image: '', link: '#' },
              { name: 'Salade', price: '0,99 €', image: '', link: '#' },
            ]),
            textColor: '#000000',
            backgroundColor: '#ffffff',
          },
        },
        {
          id: 'products-catalog-2',
          type: 'featured-products',
          order: 2,
          props: {
            title: 'Boulangerie & Pâtisserie',
            subtitle: '',
            columns: 4,
            products: JSON.stringify([
              { name: 'Baguette tradition', price: '1,29 €', image: '', link: '#' },
              { name: 'Croissants x4', price: '3,49 €', image: '', link: '#' },
              { name: 'Pain de campagne', price: '2,99 €', image: '', link: '#' },
              { name: 'Brioche', price: '2,49 €', image: '', link: '#' },
            ]),
            textColor: '#000000',
            backgroundColor: '#f9fafb',
          },
        },
      ],
    },
    {
      title: 'À propos',
      slug: 'a-propos',
      type: 'custom',
      status: 'published',
      metaTitle: 'À propos de notre Drive',
      metaDescription: 'Découvrez notre histoire et nos engagements',
      components: [
        {
          id: 'hero-about',
          type: 'hero',
          order: 0,
          props: {
            title: 'Notre Drive',
            height: 'md',
            subtitle: 'Des produits frais et locaux, à portée de clic',
            alignment: 'center',
            textColor: '#ffffff',
            backgroundType: 'color',
            backgroundColor: '#1e3a5f',
          },
        },
        {
          id: 'text-about',
          type: 'text',
          order: 1,
          props: {
            content: 'Notre Drive est né d\'une idée simple : rendre les courses agréables et sans contrainte. Nous sélectionnons chaque produit avec soin auprès de producteurs locaux et de fournisseurs de confiance pour vous garantir fraîcheur et qualité.',
            alignment: 'center',
          },
        },
        {
          id: 'features-about',
          type: 'features',
          order: 2,
          props: {
            title: 'Nos engagements',
            columns: 3,
            features: JSON.stringify([
              { icon: 'heart', title: 'Produits frais', description: 'Sélection quotidienne, qualité garantie' },
              { icon: 'truck', title: 'Circuit court', description: 'Partenaires locaux privilégiés' },
              { icon: 'shield', title: 'Prix justes', description: 'Transparence sur nos marges' },
            ]),
            textColor: '#000000',
            backgroundColor: '#f9fafb',
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

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [DRIVE_TEMPLATE];
