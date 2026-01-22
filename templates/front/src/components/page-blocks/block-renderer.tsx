'use client';

import { ComponentType } from 'react';
import { PageComponent } from '@/features/personnalisation/pages/types/page.types';
import { BlockContext } from './types';
import { HeroBlock } from './hero-block';
import { HeadingBlock } from './heading-block';
import { TextBlock } from './text-block';
import { ImageBlock } from './image-block';
import { SpacerBlock } from './spacer-block';
import { ButtonBlock } from './button-block';
import { DividerBlock } from './divider-block';
import { QuoteBlock } from './quote-block';
import { ListBlock } from './list-block';
import { VideoBlock } from './video-block';
import { GridBlock } from './grid-block';

const BLOCK_COMPONENTS: Record<string, ComponentType<any>> = {
  hero: HeroBlock,
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  spacer: SpacerBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  quote: QuoteBlock,
  list: ListBlock,
  video: VideoBlock,
  grid: GridBlock,
};

interface BlockRendererProps {
  component: PageComponent;
  context?: BlockContext;
}

export function BlockRenderer({ component, context }: BlockRendererProps) {
  const BlockComponent = BLOCK_COMPONENTS[component.type];

  if (!BlockComponent) {
    return (
      <div className="rounded-lg border border-dashed border-destructive bg-destructive/10 p-4 text-center text-destructive">
        Composant inconnu: {component.type}
      </div>
    );
  }

  // Pass children for container components like grid
  if (component.type === 'grid') {
    return (
      <BlockComponent
        {...component.props}
        gridChildren={component.children}
        context={context}
      />
    );
  }

  return <BlockComponent {...component.props} context={context} />;
}

interface PageRendererProps {
  components: PageComponent[];
  context?: BlockContext;
  onSelectComponent?: (id: string) => void;
  selectedComponentId?: string | null;
}

export function PageRenderer({
  components,
  context,
  onSelectComponent,
  selectedComponentId,
}: PageRendererProps) {
  const sortedComponents = [...components].sort((a, b) => a.order - b.order);

  return (
    <div className="page-content">
      {sortedComponents.map((component) => (
        <div
          key={component.id}
          onClick={() => onSelectComponent?.(component.id)}
          className="cursor-pointer"
        >
          <BlockRenderer
            component={component}
            context={{
              ...context,
              mode: context?.mode || 'preview',
              isSelected: selectedComponentId === component.id,
              onSelect: () => onSelectComponent?.(component.id),
            }}
          />
        </div>
      ))}
    </div>
  );
}
