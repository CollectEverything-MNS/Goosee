'use client';

import { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PageRenderer } from '@/components/page-blocks';
import { PageComponent } from '../../types/page.types';
import { cn } from '@/lib/utils';

interface PageBuilderPreviewProps {
  components: PageComponent[];
  selectedComponentId: string | null;
  onSelectComponent: (id: string) => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_CONFIG: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablette' },
  mobile: { width: '375px', label: 'Mobile' },
};

export function PageBuilderPreview({
  components,
  selectedComponentId,
  onSelectComponent,
}: PageBuilderPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  return (
    <div className="flex h-full flex-col bg-muted/30">
      {/* Viewport Toolbar */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">Preview</span>
        <div className="flex items-center gap-1">
          <Button
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewport('desktop')}
            title="Desktop"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewport('tablet')}
            title="Tablette"
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewport('mobile')}
            title="Mobile"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <ScrollArea className="flex-1">
        <div className="flex min-h-full justify-center p-4">
          <div
            className={cn(
              'min-h-full bg-background transition-all duration-300',
              viewport !== 'desktop' && 'rounded-lg border shadow-lg'
            )}
            style={{
              width: VIEWPORT_CONFIG[viewport].width,
              maxWidth: '100%',
            }}
          >
            {components.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg font-medium">Votre page est vide</p>
                  <p className="mt-1 text-sm">
                    Glissez des composants depuis la sidebar pour construire votre page
                  </p>
                </div>
              </div>
            ) : (
              <PageRenderer
                components={components}
                context={{ mode: 'preview' }}
                selectedComponentId={selectedComponentId}
                onSelectComponent={onSelectComponent}
              />
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t bg-background px-4 py-1.5 text-center">
        <span className="text-xs text-muted-foreground">
          {VIEWPORT_CONFIG[viewport].label} ({VIEWPORT_CONFIG[viewport].width})
        </span>
      </div>
    </div>
  );
}
