'use client';

import { COMPONENT_DEFINITIONS } from '../../types/page.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Grid3X3,
  Image,
  Layout,
  List,
  Mail,
  Megaphone,
  MessageCircle,
  MoveVertical,
  ShoppingBag,
  Type,
} from 'lucide-react';
import {
  PageBuilderSidebarDraggableItem,
} from '@/features/personnalisation/pages/components/page-builder/page-builder-sidebar-draggable-item';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: Layout,
  type: Type,
  image: Image,
  grid: Grid3X3,
  megaphone: Megaphone,
  mail: Mail,
  'shopping-bag': ShoppingBag,
  list: List,
  'message-circle': MessageCircle,
  'move-vertical': MoveVertical,
};


export function PageBuilderSidebar() {
  return (
    <div className="w-64 border-r bg-card">
      <div className="border-b p-4">
        <h3 className="font-semibold">Composants</h3>
        <p className="text-xs text-muted-foreground">
          Glissez un composant dans la page
        </p>
      </div>

      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="grid grid-cols-2 gap-2 p-4">
          {COMPONENT_DEFINITIONS.map((definition) => {
            const Icon = ICONS[definition.icon] || Layout;

            return (
              <PageBuilderSidebarDraggableItem
                key={definition.type}
                definition={definition}
                Icon={Icon}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}