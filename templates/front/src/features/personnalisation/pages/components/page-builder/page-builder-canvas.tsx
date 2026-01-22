'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COMPONENT_DEFINITIONS, PageComponent } from '../../types/page.types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';

interface PageBuilderCanvasProps {
  components: PageComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

interface SortableComponentProps {
  component: PageComponent;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableComponent({
  component,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const definition = COMPONENT_DEFINITIONS.find((d) => d.type === component.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border bg-card p-4 transition-all',
        isSelected && 'ring-2 ring-primary',
        isDragging && 'opacity-50'
      )}
      onClick={onSelect}
    >
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </Button>
      </div>

      <div className="absolute -right-3 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
          {definition?.label || component.type}
        </span>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        <ComponentPreview component={component} />
      </div>
    </div>
  );
}

function ComponentPreview({ component }: { component: PageComponent }) {
  const props = component.props;

  switch (component.type) {
    case 'hero':
      return (
        <div className="rounded bg-muted/50 p-4 text-center">
          <div className="font-semibold">{props.title as string}</div>
          <div className="text-xs">{props.subtitle as string}</div>
        </div>
      );
    case 'text':
      return (
        <div
          className="line-clamp-2 text-xs"
          dangerouslySetInnerHTML={{ __html: (props.content as string) || '' }}
        />
      );
    case 'cta':
      return (
        <div className="rounded bg-primary/10 p-2 text-center">
          <div className="font-medium">{props.title as string}</div>
          <div className="text-xs">{props.description as string}</div>
        </div>
      );
    case 'product-grid':
      return (
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded bg-muted" />
          ))}
        </div>
      );
    case 'contact-form':
      return (
        <div className="space-y-1">
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-2 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>
      );
    case 'spacer':
      return <div className="h-4 border-y border-dashed" />;
    default:
      return <div className="text-xs italic">Aperçu non disponible</div>;
  }
}

export function PageBuilderCanvas({
                                    components,
                                    selectedComponentId,
                                    onSelectComponent,
                                    onDeleteComponent,
                                    onDuplicateComponent,
                                  }: PageBuilderCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div ref={setNodeRef} className="flex-1 bg-muted/30">
      <ScrollArea className="h-full">
        <div className="mx-auto space-y-4 p-8">
          {components.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">
                Glissez des composants depuis la barre latérale
              </p>
            </div>
          ) : (
            components
              .sort((a, b) => a.order - b.order)
              .map((component) => (
                <SortableComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponentId === component.id}
                  onSelect={() => onSelectComponent(component.id)}
                  onDelete={() => onDeleteComponent(component.id)}
                  onDuplicate={() => onDuplicateComponent(component.id)}
                />
              ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
