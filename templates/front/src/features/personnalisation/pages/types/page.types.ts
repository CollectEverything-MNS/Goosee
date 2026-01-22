import { CATEGORY_BASIC_COMPONENTS } from '@/features/personnalisation/pages/types/categories/page-basic.types';
import { CATEGORY_LAYOUT_COMPONENTS } from '@/features/personnalisation/pages/types/categories/page-layout.types';

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
  | 'spacer';

export type ComponentCategory = 'basic' | 'layout';

export interface ComponentDefinition {
  type: ComponentType;
  label: string;
  icon: string;
  category: ComponentCategory;
  defaultProps: Record<string, unknown>;
}

export const COMPONENT_CATEGORIES: Record<ComponentCategory, { label: string; icon: string }> = {
  basic: { label: 'Basique', icon: 'type' },
  layout: { label: 'Mise en page', icon: 'layout' },
};

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  ...CATEGORY_BASIC_COMPONENTS,
  ...CATEGORY_LAYOUT_COMPONENTS

];
