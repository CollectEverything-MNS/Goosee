import { BAKERY_TEMPLATE } from './bakery-template';
import { BEAUTY_TEMPLATE } from './beauty-template';
import { DRIVE_TEMPLATE, type TemplateDefinition } from './drive-template';
import { RESTAURANT_TEMPLATE } from './restaurant-template';

export type { TemplateCategory, TemplateDefinition, TemplatePage, TemplateMenu } from './drive-template';

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [
  DRIVE_TEMPLATE,
  BAKERY_TEMPLATE,
  RESTAURANT_TEMPLATE,
  BEAUTY_TEMPLATE,
];
