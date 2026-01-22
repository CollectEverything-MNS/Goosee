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
  },
  {
    type: 'button',
    label: 'Bouton',
    icon: 'mouse-pointer-click',
    category: 'basic',
    defaultProps: {
      text: 'Cliquez ici',
      link: '#',
      variant: 'primary',
      size: 'md',
      alignment: 'left',
    },
  },
  {
    type: 'divider',
    label: 'Séparateur',
    icon: 'minus',
    category: 'basic',
    defaultProps: {
      style: 'solid',
      color: '',
      width: 'full',
    },
  },
  {
    type: 'quote',
    label: 'Citation',
    icon: 'quote',
    category: 'basic',
    defaultProps: {
      content: 'Votre citation ici...',
      author: '',
      alignment: 'left',
      color: '',
    },
  },
  {
    type: 'list',
    label: 'Liste',
    icon: 'list',
    category: 'basic',
    defaultProps: {
      items: 'Élément 1\nÉlément 2\nÉlément 3',
      style: 'bullet',
      alignment: 'left',
      color: '',
    },
  },
]