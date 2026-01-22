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
import { COMPONENT_DEFINITIONS, ComponentType, PageComponent } from '../../types/page.types';
import { PageBuilderSidebar } from './page-builder-sidebar';
import { PageBuilderCanvas } from './page-builder-canvas';
import { PageBuilderComponentEditor } from './page-builder-component-editor';
import { PageBuilderDragOverlay } from './page-builder-drag-overlay';

interface PageBuilderProps {
  components: PageComponent[];
  onChange: (components: PageComponent[]) => void;
}

export function PageBuilder({ components, onChange }: PageBuilderProps) {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<'sidebar' | 'canvas' | null>(null);

  const selectedComponent = components.find((c) => c.id === selectedComponentId);

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

    // Dragging from sidebar to canvas
    if (active.data.current?.fromSidebar) {
      const componentType = active.data.current.type as ComponentType;
      const definition = COMPONENT_DEFINITIONS.find((d) => d.type === componentType);

      if (!definition) return;

      const newComponent: PageComponent = {
        id: crypto.randomUUID(),
        type: componentType,
        props: { ...definition.defaultProps },
        order: components.length,
      };

      // If dropping on a specific component, insert after it
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
    if (active.id !== over.id && over.id !== 'canvas-droppable') {
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
    onChange(components.filter((c) => c.id !== id));
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
    onChange(
      components.map((c) => (c.id === id ? { ...c, props: { ...c.props, ...props } } : c))
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-200px)] gap-0 overflow-hidden rounded-lg border">
        <PageBuilderSidebar />

        <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <PageBuilderCanvas
            components={components}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            onDeleteComponent={handleDeleteComponent}
            onDuplicateComponent={handleDuplicateComponent}
          />
        </SortableContext>

        {selectedComponent && (
          <PageBuilderComponentEditor
            component={selectedComponent}
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
