import { ComponentDefinition } from '@/features/personnalisation/pages/types/page.types';

export const CATEGORY_LAYOUT_COMPONENTS: ComponentDefinition[] = [
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
]