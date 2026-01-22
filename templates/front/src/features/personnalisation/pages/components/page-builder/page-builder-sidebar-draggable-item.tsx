'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { ComponentDefinition } from '../../types/page.types';
import { cn } from '@/lib/utils';

interface SidebarDraggableItemProps {
  definition: ComponentDefinition;
  Icon: React.ComponentType<{ className?: string }>;
}

export function PageBuilderSidebarDraggableItem({
                                       definition,
                                       Icon,
                                     }: SidebarDraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: definition.type,
      data: {
        fromSidebar: true,
        type: definition.type,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Button
      ref={setNodeRef}
      style={style}
      variant="outline"
      className={cn(
        'flex h-20 flex-col items-center justify-center gap-2',
        isDragging && 'opacity-50'
      )}
      {...listeners}
      {...attributes}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{definition.label}</span>
    </Button>
  );
}
