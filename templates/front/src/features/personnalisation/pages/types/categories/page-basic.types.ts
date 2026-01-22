import { ComponentDefinition } from '@/features/personnalisation/pages/types/page.types';

export const CATEGORY_BASIC_COMPONENTS: ComponentDefinition[] = [
  {
    type: 'heading',
    label: 'Titre',
    icon: 'heading',
    category: 'basic',
    defaultProps: {
      content: 'Votre titre',
      level: 'h2',
      alignment: 'left',
      color: '',
    },
  },
  {
    type: 'text',
    label: 'Texte',
    icon: 'type',
    category: 'basic',
    defaultProps: {
      content: 'Votre texte ici...',
      alignment: 'left',
      color: '',
    },
  },
  {
    type: 'image',
    label: 'Image',
    icon: 'image',
    category: 'basic',
    defaultProps: {
      src: '',
      alt: 'Description de l\'image',
      width: 'full',
      alignment: 'center',
      rounded: false,
    },
  }
]