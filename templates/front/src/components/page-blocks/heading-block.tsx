'use client';

import { cn } from '@/lib/utils';
import { HeadingBlockProps, BlockPropsWithContext } from './types';

const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const SIZE_CLASSES: Record<string, string> = {
  h1: 'text-4xl md:text-5xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  h5: 'text-lg md:text-xl font-medium',
  h6: 'text-base md:text-lg font-medium',
};

interface ExtendedHeadingBlockProps extends HeadingBlockProps {
  color?: string;
}

export function HeadingBlock({
  content,
  level = 'h2',
  alignment = 'left',
  color,
  context,
}: BlockPropsWithContext<ExtendedHeadingBlockProps>) {
  const headingContent = content || 'Votre titre';
  const sizeClass = SIZE_CLASSES[level];

  const renderHeading = () => {
    const baseClass = cn(sizeClass, !color && 'text-foreground');
    const style = color ? { color } : undefined;

    switch (level) {
      case 'h1':
        return <h1 className={baseClass} style={style}>{headingContent}</h1>;
      case 'h2':
        return <h2 className={baseClass} style={style}>{headingContent}</h2>;
      case 'h3':
        return <h3 className={baseClass} style={style}>{headingContent}</h3>;
      case 'h4':
        return <h4 className={baseClass} style={style}>{headingContent}</h4>;
      case 'h5':
        return <h5 className={baseClass} style={style}>{headingContent}</h5>;
      case 'h6':
        return <h6 className={baseClass} style={style}>{headingContent}</h6>;
      default:
        return <h2 className={baseClass} style={style}>{headingContent}</h2>;
    }
  };

  return (
    <div
      className={cn(
        'px-4 py-6 md:px-8',
        ALIGNMENT_CLASSES[alignment],
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      {renderHeading()}
    </div>
  );
}
