'use client';

import { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Copy,
  GripVertical,
  Monitor,
  Pencil,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { BlockRenderer } from '@/components/page-blocks/block-renderer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import { COMPONENT_DEFINITIONS, ComponentType, PageComponent } from '../../types/page.types';

import { BlockPicker } from './block-picker';
import { PageBuilderComponentEditor } from './page-builder-component-editor';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface Props {
  components: PageComponent[];
  onChange: (components: PageComponent[]) => void;
}

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

function findComponent(components: PageComponent[], id: string | null): PageComponent | undefined {
  if (!id) return undefined;
  const root = components.find((c) => c.id === id);
  if (root) return root;
  for (const c of components) {
    if (c.children) {
      const child = c.children.find((ch) => ch.id === id);
      if (child) return child;
    }
  }
  return undefined;
}

export function PageBuilderStack({ components, onChange }: Props) {
  const t = useTranslations('admin.pageBuilder');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [insertAfter, setInsertAfter] = useState<string | 'end'>('end');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const selected = findComponent(components, selectedId);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = components.findIndex((c) => c.id === active.id);
    const newIndex = components.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(components, oldIndex, newIndex).map((c, i) => ({ ...c, order: i }));
    onChange(next);
  };

  const insertBlock = (type: ComponentType) => {
    const definition = COMPONENT_DEFINITIONS.find((d) => d.type === type);
    if (!definition) return;
    const newComponent: PageComponent = {
      id: crypto.randomUUID(),
      type,
      props: { ...definition.defaultProps },
      order: 0,
    };
    let next: PageComponent[];
    if (insertAfter === 'end') {
      next = [...components, newComponent];
    } else {
      const idx = components.findIndex((c) => c.id === insertAfter);
      next = [...components];
      next.splice(idx + 1, 0, newComponent);
    }
    onChange(next.map((c, i) => ({ ...c, order: i })));
    setSelectedId(newComponent.id);
  };

  const openPicker = (after: string | 'end') => {
    setInsertAfter(after);
    setPickerOpen(true);
  };

  const deleteComponent = (id: string) => {
    onChange(components.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateComponent = (id: string) => {
    const idx = components.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const original = components[idx];
    const copy: PageComponent = {
      ...original,
      id: crypto.randomUUID(),
      props: { ...original.props },
    };
    const next = [...components];
    next.splice(idx + 1, 0, copy);
    onChange(next.map((c, i) => ({ ...c, order: i })));
  };

  const updateComponent = (id: string, props: Record<string, unknown>) => {
    onChange(
      components.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...props } } : c))
    );
  };

  const sorted = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="rounded-xl border border-border bg-muted/20">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('preview.title')}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewport('desktop')}
            className="h-8 px-2"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewport('tablet')}
            className="h-8 px-2"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewport('mobile')}
            className="h-8 px-2"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center px-4 py-6">
        <div
          className={cn(
            'w-full bg-background shadow-sm transition-all duration-300',
            viewport !== 'desktop' && 'rounded-lg border',
          )}
          style={{ maxWidth: VIEWPORT_WIDTHS[viewport] }}
        >
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-sm text-muted-foreground">{t('canvas.emptyState')}</p>
              <Button onClick={() => openPicker('end')} className="gap-2">
                <Plus className="h-4 w-4" />
                {t('addBlock')}
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sorted.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div>
                  {sorted.map((component, index) => (
                    <div key={component.id}>
                      <StackBlock
                        component={component}
                        isSelected={selectedId === component.id}
                        onSelect={() => setSelectedId(component.id)}
                        onEdit={() => setSelectedId(component.id)}
                        onDuplicate={() => duplicateComponent(component.id)}
                        onDelete={() => deleteComponent(component.id)}
                      />
                      <BlockSeparator onAdd={() => openPicker(component.id)} isLast={index === sorted.length - 1} />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <BlockPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={insertBlock}
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader className="border-b border-border px-6 py-4">
                <DialogTitle className="text-base font-semibold">
                  {t(`components.${selected.type}`)}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {t('editor.editComponent')}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[calc(90vh-3.5rem)] overflow-hidden">
                <PageBuilderComponentEditor
                  component={selected}
                  allComponents={components}
                  onUpdate={(props) => updateComponent(selected.id, props)}
                  onClose={() => setSelectedId(null)}
                  embedded
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface StackBlockProps {
  component: PageComponent;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function StackBlock({ component, isSelected, onSelect, onEdit, onDuplicate, onDelete }: StackBlockProps) {
  const t = useTranslations('admin.pageBuilder');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative cursor-pointer',
        isDragging && 'opacity-50',
        isSelected && 'ring-2 ring-primary ring-offset-2',
      )}
      onClick={onSelect}
    >
      <div className="pointer-events-none">
        <BlockRenderer component={component} context={{ mode: 'preview' }} />
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-0 transition-colors',
          isSelected ? 'bg-primary/5' : 'group-hover:bg-foreground/5',
        )}
      />

      <div
        className={cn(
          'absolute left-2 top-2 flex items-center gap-1 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 cursor-grab shadow-sm"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          title={t('actions.move')}
          aria-label={t('actions.move')}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        className={cn(
          'absolute right-2 top-2 flex items-center gap-1 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title={t('actions.edit')}
          aria-label={t('actions.edit')}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title={t('actions.duplicate')}
          aria-label={t('actions.duplicate')}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 shadow-sm text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title={t('actions.delete')}
          aria-label={t('actions.delete')}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function BlockSeparator({ onAdd, isLast }: { onAdd: () => void; isLast: boolean }) {
  const t = useTranslations('admin.pageBuilder');
  return (
    <div
      className={cn(
        'group/sep relative flex items-center justify-center',
        isLast ? 'py-6' : 'py-3',
      )}
    >
      <div className="absolute inset-x-6 top-1/2 h-px bg-border opacity-0 transition-opacity group-hover/sep:opacity-100" />
      <Button
        variant="outline"
        size="sm"
        onClick={onAdd}
        className={cn(
          'relative z-10 h-8 gap-2 bg-background opacity-50 transition-all hover:opacity-100 group-hover/sep:opacity-100',
          isLast && 'opacity-100',
        )}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="text-xs">{t('addBlock')}</span>
      </Button>
    </div>
  );
}
