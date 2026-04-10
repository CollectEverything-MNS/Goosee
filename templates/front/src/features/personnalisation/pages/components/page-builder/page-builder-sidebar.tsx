'use client';

import { COMPONENT_DEFINITIONS, ComponentCategory } from '../../types/page.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';
import {
  Grid3X3,
  Heading,
  Image,
  Layout,
  List,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Minus,
  MousePointerClick,
  MoveVertical,
  Play,
  ShoppingBag,
  Navigation,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Type,
} from 'lucide-react';
import {
  PageBuilderSidebarDraggableItem,
} from '@/features/personnalisation/pages/components/page-builder/page-builder-sidebar-draggable-item';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: Layout,
  type: Type,
  heading: Heading,
  image: Image,
  'grid-3x3': Grid3X3,
  megaphone: Megaphone,
  mail: Mail,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  quote: MessageSquareQuote,
  'separator-horizontal': MoveVertical,
  'mouse-pointer-click': MousePointerClick,
  minus: Minus,
  list: List,
  play: Play,
  navigation: Navigation,
  package: Package,
  'message-square': MessageSquareQuote,
  'shield-check': ShieldCheck,
  'shopping-cart': ShoppingCart,
};

const CATEGORY_ICONS: Record<ComponentCategory, React.ComponentType<{ className?: string }>> = {
  basic: Type,
  layout: Layout,
  ecommerce: ShoppingCart,
};

const CATEGORY_ORDER: ComponentCategory[] = ['layout', 'basic', 'ecommerce'];

export function PageBuilderSidebar() {
  const t = useTranslations('admin.pageBuilder');

  const componentsByCategory = COMPONENT_DEFINITIONS.reduce((acc, def) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push(def);
    return acc;
  }, {} as Record<ComponentCategory, typeof COMPONENT_DEFINITIONS>);

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="border-b p-3">
        <h3 className="font-semibold text-sm">{t('sidebar.title')}</h3>
        <p className="text-xs text-muted-foreground">
          {t('sidebar.subtitle')}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={['layout', 'basic', 'ecommerce']} className="px-2">
          {CATEGORY_ORDER.map((categoryKey) => {
            const components = componentsByCategory[categoryKey];
            if (!components || components.length === 0) return null;

            const CategoryIcon = CATEGORY_ICONS[categoryKey];

            return (
              <AccordionItem key={categoryKey} value={categoryKey} className="border-b-0">
                <AccordionTrigger className="py-2 text-sm hover:no-underline">
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{t(`categories.${categoryKey}`)}</span>
                    <span className="ml-auto mr-2 text-xs text-muted-foreground">
                      {components.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <div className="flex flex-wrap gap-1.5">
                    {components.map((definition) => {
                      const Icon = ICONS[definition.icon] || Layout;
                      const translatedLabel = t(`components.${definition.type}`);

                      return (
                        <PageBuilderSidebarDraggableItem
                          key={definition.type}
                          definition={{ ...definition, label: translatedLabel }}
                          Icon={Icon}
                        />
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
