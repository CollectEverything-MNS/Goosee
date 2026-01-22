'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { COMPONENT_DEFINITIONS, PageComponent } from '../../types/page.types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { BlockRenderer } from '@/components/page-blocks';

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

  // Afficher un aperçu simplifié selon le type
  const getPreviewContent = () => {
    switch (component.type) {
      case 'hero': {
        const subtitle = props.subtitle as string | undefined;
        return (
          <div className="rounded bg-gradient-to-r from-primary/20 to-primary/5 p-3 text-center">
            <div className="font-medium text-sm">{String(props.title || 'Hero')}</div>
            {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
          </div>
        );
      }
      case 'heading':
        return (
          <div className="text-sm font-medium">
            {String(props.content || 'Titre')}
            <span className="ml-2 text-xs text-muted-foreground">({String(props.level || 'h2')})</span>
          </div>
        );
      case 'text':
        return (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {(props.content as string)?.replace(/<[^>]*>/g, '') || 'Texte...'}
          </div>
        );
      case 'image':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">📷</div>
            {(props.alt as string) || 'Image'}
          </div>
        );
      case 'cta':
        return (
          <div className="rounded bg-primary/10 p-2 text-center text-sm">
            {(props.title as string) || 'Call to Action'}
          </div>
        );
      case 'product-grid':
        return (
          <div className="grid grid-cols-4 gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded bg-muted text-[8px] flex items-center justify-center">🛍️</div>
            ))}
          </div>
        );
      case 'features':
        return (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 rounded bg-muted p-1 text-center text-[10px]">Feature {i}</div>
            ))}
          </div>
        );
      case 'testimonials':
        return (
          <div className="text-xs text-muted-foreground italic">&quot;Témoignages clients...&quot;</div>
        );
      case 'contact-form':
        return (
          <div className="space-y-1">
            <div className="h-2 w-full rounded bg-muted" />
            <div className="h-2 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-primary/20" />
          </div>
        );
      case 'gallery':
        return (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded bg-muted text-[8px] flex items-center justify-center">🖼️</div>
            ))}
          </div>
        );
      case 'spacer':
        return <div className="h-4 border-y border-dashed border-muted-foreground/30" />;
      default:
        return <div className="text-xs italic text-muted-foreground">Aperçu</div>;
    }
  };

  return (
    <div className="pointer-events-none">
      {getPreviewContent()}
    </div>
  );
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
    <div ref={setNodeRef} className="h-full overflow-hidden bg-muted/30">
      <ScrollArea className="h-full">
        <div className="space-y-3 p-4">
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
