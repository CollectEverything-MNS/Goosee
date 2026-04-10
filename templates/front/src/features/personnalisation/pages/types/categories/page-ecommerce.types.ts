import { ComponentDefinition } from '@/features/personnalisation/pages/types/page.types';

export const CATEGORY_ECOMMERCE_COMPONENTS: ComponentDefinition[] = [
  {
    type: 'featured-products',
    label: 'Produits vedettes',
    icon: 'package',
    category: 'ecommerce',
    defaultProps: {
      title: 'Nos produits',
      subtitle: 'Découvrez notre sélection',
      columns: 3,
      products: JSON.stringify([
        { name: 'Produit 1', price: '29,99 €', image: '', link: '#' },
        { name: 'Produit 2', price: '49,99 €', image: '', link: '#' },
        { name: 'Produit 3', price: '19,99 €', image: '', link: '#' },
      ]),
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },
  {
    type: 'testimonials',
    label: 'Témoignages',
    icon: 'message-square',
    category: 'ecommerce',
    defaultProps: {
      title: 'Ce que disent nos clients',
      testimonials: JSON.stringify([
        { name: 'Marie D.', text: 'Excellent service, je recommande !', rating: 5 },
        { name: 'Pierre L.', text: 'Livraison rapide et produit conforme.', rating: 4 },
        { name: 'Sophie M.', text: 'Très satisfaite de mon achat.', rating: 5 },
      ]),
      backgroundColor: '#f9fafb',
      textColor: '#000000',
    },
  },
  {
    type: 'banner',
    label: 'Bannière promo',
    icon: 'megaphone',
    category: 'ecommerce',
    defaultProps: {
      title: 'Soldes d\'été',
      subtitle: 'Jusqu\'à -50% sur une sélection d\'articles',
      buttonText: 'En profiter',
      buttonLink: '#',
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      alignment: 'center',
    },
  },
  {
    type: 'features',
    label: 'Avantages',
    icon: 'shield-check',
    category: 'ecommerce',
    defaultProps: {
      title: 'Pourquoi nous choisir',
      features: JSON.stringify([
        { icon: 'truck', title: 'Livraison gratuite', description: 'Dès 50€ d\'achat' },
        { icon: 'undo', title: 'Retours gratuits', description: 'Sous 30 jours' },
        { icon: 'lock', title: 'Paiement sécurisé', description: 'SSL 256 bits' },
        { icon: 'headphones', title: 'Support 7j/7', description: 'À votre écoute' },
      ]),
      columns: 4,
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
  },
];
