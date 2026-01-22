'use client';

import { COMPONENT_DEFINITIONS } from '../../types/page.types';
import { cn } from '@/lib/utils';

interface PageBuilderDragOverlayProps {
  activeId: string;
  type: 'sidebar' | 'canvas' | null;
}

export function PageBuilderDragOverlay({
                                         activeId,
                                         type,
                                       }: PageBuilderDragOverlayProps) {
  if (!type) return null;

  if (type === 'sidebar') {
    const definition = COMPONENT_DEFINITIONS.find(
      (d) => d.type === activeId
    );

    if (!definition) return null;

    return (
      <OverlayWrapper>
        <span className="rounded bg-muted px-2 py-1 text-xs font-medium">
          {definition.label}
        </span>
      </OverlayWrapper>
    );
  }

  return (
    <OverlayWrapper>
      <div className="text-xs italic text-muted-foreground">
        Déplacement…
      </div>
    </OverlayWrapper>
  );
}

function OverlayWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'w-64 rounded-lg border bg-card p-4 shadow-lg',
        'cursor-grabbing'
      )}
    >
      {children}
    </div>
  );
}
