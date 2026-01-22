export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum PageType {
  HOME = 'home',
  CATALOG = 'catalog',
  CONTACT = 'contact',
  CUSTOM = 'custom',
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  order: number;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  type: PageType;
  components: PageComponent[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type ComponentType =
  | 'hero'
  | 'heading'
  | 'text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'contact-form'
  | 'product-grid'
  | 'features'
  | 'testimonials'
  | 'spacer';

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  defaultProps: Record<string, unknown>;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'heading',
    label: 'Titre',
    icon: 'heading',
    defaultProps: {
      content: 'Votre titre',
      level: 'h2',
      alignment: 'left',
    },
  },
  {
    type: 'text',
    label: 'Bloc de texte',
    icon: 'type',
    defaultProps: {
      content: 'Votre texte ici...',
      alignment: 'left',
    },
  }
];
