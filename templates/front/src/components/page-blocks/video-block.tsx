'use client';

import { cn } from '@/lib/utils';
import { BlockPropsWithContext, VideoBlockProps } from './types';
import { Play } from 'lucide-react';

const ALIGNMENT_CLASSES = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
};

const ASPECT_RATIO_CLASSES = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
};

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Déjà une URL embed
  if (url.includes('embed') || url.includes('player')) {
    return url;
  }

  return null;
}

export function VideoBlock({
  url,
  title,
  aspectRatio = '16:9',
  alignment = 'center',
  context,
}: BlockPropsWithContext<VideoBlockProps>) {
  const embedUrl = getEmbedUrl(url);
  const isPreview = context?.mode === 'preview';

  return (
    <div
      className={cn(
        'px-4 py-4 md:px-8',
        context?.isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={context?.onSelect}
    >
      <div
        className={cn(
          'w-full max-w-3xl overflow-hidden rounded-lg',
          ALIGNMENT_CLASSES[alignment]
        )}
      >
        {embedUrl ? (
          <div className={cn('relative', ASPECT_RATIO_CLASSES[aspectRatio])}>
            <iframe
              src={embedUrl}
              title={title || 'Vidéo'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={cn(
                'absolute inset-0 h-full w-full',
                isPreview && 'pointer-events-none'
              )}
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex items-center justify-center bg-muted',
              ASPECT_RATIO_CLASSES[aspectRatio]
            )}
          >
            <div className="text-center text-muted-foreground">
              <Play className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2 text-sm">
                {url ? 'URL non supportée' : 'Ajoutez une URL YouTube ou Vimeo'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
