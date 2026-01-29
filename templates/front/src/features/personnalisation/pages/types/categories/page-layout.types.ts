import { ComponentDefinition } from '@/features/personnalisation/pages/types/page.types';

export const CATEGORY_LAYOUT_COMPONENTS: ComponentDefinition[] = [
  {
    type: 'header',
    label: 'Header',
    icon: 'navigation',
    category: 'layout',
    defaultProps: {
      logoPosition: 'left',
      showMenu: true,
      menuAlignment: 'right',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      sticky: false,
      height: 'md',
    },
  },
  {
    type: 'hero',
    label: 'Hero',
    icon: 'layout',
    category: 'layout',
    defaultProps: {
      title: 'Projet fil rouge',
      subtitle: 'Test app goosee descrip',
      buttonText: 'En savoir plus',
      buttonLink: '#',
      alignment: 'center',
      height: 'lg',
      backgroundType: 'color',
      backgroundColor: '#3b82f6',
      backgroundImage: '',
      overlay: true,
      textColor: '#ffffff',
    },
  },
  {
    type: 'spacer',
    label: 'Espacement',
    icon: 'separator-horizontal',
    category: 'layout',
    defaultProps: {
      height: 'md',
    },
  },
  {
    type: 'video',
    label: 'Vidéo',
    icon: 'play',
    category: 'layout',
    defaultProps: {
      url: '',
      title: 'Vidéo',
      aspectRatio: '16:9',
      alignment: 'center',
    },
  },
  {
    type: 'grid',
    label: 'Grille',
    icon: 'grid-3x3',
    category: 'layout',
    defaultProps: {
      columns: 2,
      gap: 'md',
      backgroundColor: '',
      padding: 'md',
    },
  },
]