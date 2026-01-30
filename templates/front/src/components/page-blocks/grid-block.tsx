'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, GridBlockProps } from './types';
import { PageComponent } from '@/features/personnalisation/pages/types/page.types';
import { BlockRenderer } from './block-renderer';

interface GridBlockComponentProps extends GridBlockProps {
  gridChildren?: PageComponent[];
  context?: BlockPropsWithContext<GridBlockProps>['context'];
}

export function GridBlock({
  columns = 2,
  gap = 'md',
  backgroundColor,
  padding = 'md',
  gridChildren = [],
  context,
}: GridBlockComponentProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const sortedChildren = [...gridChildren].sort((a, b) => a.order - b.order);

  return (
    <div
      className={cn(
        'grid w-full rounded-lg',
        columnClasses[columns],
        gapClasses[gap],
        paddingClasses[padding],
        context?.mode === 'preview' && context?.isSelected && 'ring-2 ring-primary'
      )}
      style={{
        backgroundColor: backgroundColor || undefined,
      }}
    >
      {sortedChildren.length > 0 ? (
        sortedChildren.map((child) => (
          <div
            key={child.id}
            className={cn(
              'min-h-[50px] cursor-pointer rounded-lg transition-all',
              context?.selectedComponentId === child.id && 'ring-2 ring-primary'
            )}
            onClick={(e) => {
              e.stopPropagation();
              context?.onSelectComponent?.(child.id);
            }}
          >
            <BlockRenderer
              component={child}
              context={{
                ...context,
                mode: context?.mode || 'preview',
                isSelected: context?.selectedComponentId === child.id,
                onSelect: () => context?.onSelectComponent?.(child.id),
              }}
            />
          </div>
        ))
      ) : (
        <div
          className={cn(
            'col-span-full flex min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30',
            context?.mode === 'preview' && 'bg-muted/50'
          )}
        >
          <p className="text-sm text-muted-foreground">
            Glissez des composants ici
          </p>
        </div>
      )}
    </div>
  );
}
