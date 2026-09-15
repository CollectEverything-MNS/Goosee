'use client';

import { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDebounce } from '@/hooks/use-debounce';
import { COMPONENT_DEFINITIONS, ComponentType, PageComponent } from '../../types/page.types';
import { PageBuilderSidebar } from './page-builder-sidebar';
import { PageBuilderCanvas } from './page-builder-canvas';
import { PageBuilderComponentEditor } from './page-builder-component-editor';
import { PageBuilderDragOverlay } from './page-builder-drag-overlay';
import { PageBuilderPreview } from './page-builder-preview';

interface PageBuilderProps {
  components: PageComponent[];
  onChange: (components: PageComponent[]) => void;
}

export function PageBuilder({ components, onChange }: PageBuilderProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<'sidebar' | 'canvas' | null>(null);

  const debouncedComponents = useDebounce(components, 150);

  // Find component at root level or inside grids
  const findComponent = (id: string | null): PageComponent | undefined => {
    if (!id) return undefined;

    // Check root level
    const rootComponent = components.find((c) => c.id === id);
    if (rootComponent) return rootComponent;

    // Check inside grids
    for (const c of components) {
      if (c.children) {
        const childComponent = c.children.find((child) => child.id === id);
        if (childComponent) return childComponent;
      }
    }
    return undefined;
  };

  const selectedComponent = findComponent(selectedComponentId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    // Check if dragging from sidebar or canvas
    if (active.data.current?.fromSidebar) {
      setActiveDragType('sidebar');
    } else {
      setActiveDragType('canvas');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveDragType(null);

    if (!over) return;

    // Check if dropping into a grid container
    const isGridDrop = over.data.current?.isGridDropZone;
    const gridId = over.data.current?.gridId;

    if (active.data.current?.fromSidebar) {
      const componentType = active.data.current.type as ComponentType;
      const definition = COMPONENT_DEFINITIONS.find((d) => d.type === componentType);

      if (!definition) return;

      const newComponent: PageComponent = {
        id: crypto.randomUUID(),
        type: componentType,
        props: { ...definition.defaultProps },
        order: 0,
      };

      // If dropping into a grid
      if (isGridDrop && gridId) {
        const newComponents = components.map((c) => {
          if (c.id === gridId) {
            const existingChildren = c.children || [];
            newComponent.order = existingChildren.length;
            return {
              ...c,
              children: [...existingChildren, newComponent],
            };
          }
          return c;
        });
        onChange(newComponents);
        setSelectedComponentId(newComponent.id);
        return;
      }

      // If dropping on a specific component, insert after it
      newComponent.order = components.length;
      if (over.id !== 'canvas-droppable') {
        const overIndex = components.findIndex((c) => c.id === over.id);
        const newComponents = [...components];
        newComponents.splice(overIndex + 1, 0, newComponent);
        onChange(newComponents.map((c, i) => ({ ...c, order: i })));
      } else {
        onChange([...components, newComponent]);
      }

      setSelectedComponentId(newComponent.id);
      return;
    }

    // Reordering within canvas
    if (active.id !== over.id && over.id !== 'canvas-droppable' && !isGridDrop) {
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newComponents = arrayMove(components, oldIndex, newIndex).map((c, index) => ({
          ...c,
          order: index,
        }));
        onChange(newComponents);
      }
    }
  };

  const handleDeleteComponent = (id: string) => {
    // Check if component is at root level
    const isRootLevel = components.some((c) => c.id === id);

    if (isRootLevel) {
      onChange(components.filter((c) => c.id !== id));
    } else {
      // Component is inside a grid, find and remove it
      onChange(
        components.map((c) => {
          if (c.children?.some((child) => child.id === id)) {
            return {
              ...c,
              children: c.children.filter((child) => child.id !== id),
            };
          }
          return c;
        })
      );
    }

    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const handleDuplicateComponent = (id: string) => {
    const component = components.find((c) => c.id === id);
    if (!component) return;

    const index = components.findIndex((c) => c.id === id);
    const newComponent: PageComponent = {
      ...component,
      id: crypto.randomUUID(),
      props: { ...component.props },
    };

    const newComponents = [...components];
    newComponents.splice(index + 1, 0, newComponent);
    onChange(newComponents.map((c, i) => ({ ...c, order: i })));
  };

  const handleUpdateComponent = (id: string, props: Record<string, unknown>) => {
    // Check if component is at root level
    const isRootLevel = components.some((c) => c.id === id);

    if (isRootLevel) {
      onChange(
        components.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...props } } : c))
      );
    } else {
      // Component is inside a grid, find and update it
      onChange(
        components.map((c) => {
          if (c.children?.some((child) => child.id === id)) {
            return {
              ...c,
              children: c.children.map((child) =>
                child.id === id ? { ...child, props: { ...child.props, ...props } } : child
              ),
            };
          }
          return c;
        })
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative h-[calc(100vh-200px)] overflow-hidden rounded-lg border">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={12} maxSize={20}>
            <PageBuilderSidebar />
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={35} minSize={20} maxSize={50}>
            <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <PageBuilderCanvas
                components={components}
                selectedComponentId={selectedComponentId}
                onSelectComponent={setSelectedComponentId}
                onDeleteComponent={handleDeleteComponent}
                onDuplicateComponent={handleDuplicateComponent}
              />
            </SortableContext>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={30}>
            <PageBuilderPreview
              components={debouncedComponents}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
            />
          </ResizablePanel>
        </ResizablePanelGroup>

        {selectedComponent && (
          <PageBuilderComponentEditor
            component={selectedComponent}
            allComponents={debouncedComponents}
            onUpdate={(props) => handleUpdateComponent(selectedComponent.id, props)}
            onClose={() => setSelectedComponentId(null)}
          />
        )}
      </div>

      <DragOverlay>
        {activeId && <PageBuilderDragOverlay activeId={activeId} type={activeDragType} />}
      </DragOverlay>
    </DndContext>
  );
}
