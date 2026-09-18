'use client';

import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import { TextBlockProps, BlockPropsWithContext } from './types';

const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

interface ExtendedTextBlockProps extends TextBlockProps {
  color?: string;
}

export function TextBlock({
  content,
  alignment = 'left',
  color,
  context,
}: BlockPropsWithContext<ExtendedTextBlockProps>) {
  // Le contenu est de l'HTML saisi dans l'editeur de pages. On l'assainit avant affichage
  // pour empecher tout script ou gestionnaire d'evenement de s'executer chez les visiteurs.
  const safeHtml = DOMPurify.sanitize(content || 'Votre texte ici...');

  return (
    <div
      className={cn(
        'px-4 py-4 md:px-8',
        ALIGNMENT_CLASSES[alignment],
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <div
        className={cn('prose prose-sm md:prose-base max-w-none', !color && 'text-muted-foreground')}
        style={color ? { color } : undefined}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </div>
  );
}
