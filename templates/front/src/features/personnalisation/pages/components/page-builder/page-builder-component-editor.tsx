'use client';

import { COMPONENT_DEFINITIONS, PageComponent } from '../../types/page.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Settings, Type, X } from 'lucide-react';

interface PageBuilderComponentEditorProps {
  component: PageComponent;
  onUpdate: (props: Record<string, unknown>) => void;
  onClose: () => void;
}

export function PageBuilderComponentEditor({
  component,
  onUpdate,
  onClose,
}: PageBuilderComponentEditorProps) {
  const definition = COMPONENT_DEFINITIONS.find((d) => d.type === component.type);

  const handleChange = (key: string, value: unknown) => {
    onUpdate({ [key]: value });
  };

  const formatLabel = (key: string): string => {
    const labels: Record<string, string> = {
      title: 'Titre',
      subtitle: 'Sous-titre',
      content: 'Contenu',
      description: 'Description',
      buttonText: 'Texte du bouton',
      buttonLink: 'Lien du bouton',
      alignment: 'Alignement',
      level: 'Niveau',
      height: 'Hauteur',
      variant: 'Variante',
      src: 'URL de l\'image',
      alt: 'Texte alternatif',
      width: 'Largeur',
      rounded: 'Coins arrondis',
      columns: 'Colonnes',
      gap: 'Espacement',
      limit: 'Limite',
      showPrice: 'Afficher prix',
      showAddToCart: 'Bouton panier',
      submitText: 'Texte du bouton',
      overlay: 'Overlay sombre',
      backgroundType: 'Type de fond',
      backgroundColor: 'Couleur de fond',
      backgroundImage: 'Image de fond',
      textColor: 'Couleur du texte',
      color: 'Couleur',
      text: 'Texte',
      link: 'Lien',
      size: 'Taille',
      style: 'Style',
      author: 'Auteur',
      items: 'Éléments',
      url: 'URL',
      aspectRatio: 'Format',
      padding: 'Espacement interne',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
  };

  const renderField = (key: string, value: unknown) => {
    // Boolean fields
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-2">
          <input
            id={key}
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor={key}>{formatLabel(key)}</Label>
        </div>
      );
    }

    if (typeof value !== 'string' && typeof value !== 'number') return null;

    // Level (h1-h6)
    if (key === 'level') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">H1 - Très grand</SelectItem>
              <SelectItem value="h2">H2 - Grand</SelectItem>
              <SelectItem value="h3">H3 - Moyen-grand</SelectItem>
              <SelectItem value="h4">H4 - Moyen</SelectItem>
              <SelectItem value="h5">H5 - Petit</SelectItem>
              <SelectItem value="h6">H6 - Très petit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Textarea for content/description
    if (key.toLowerCase().includes('content') || key.toLowerCase().includes('description')) {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{formatLabel(key)}</Label>
          <Textarea
            id={key}
            value={value as string}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={4}
          />
        </div>
      );
    }

    // Alignment
    if (key.toLowerCase().includes('alignment')) {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Gauche</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="right">Droite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Variant
    if (key === 'variant') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Principal</SelectItem>
              <SelectItem value="secondary">Secondaire</SelectItem>
              <SelectItem value="outline">Contour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Height / Gap
    if (key === 'height' || key === 'gap') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Petit</SelectItem>
              <SelectItem value="md">Moyen</SelectItem>
              <SelectItem value="lg">Grand</SelectItem>
              <SelectItem value="xl">Très grand</SelectItem>
              {key === 'height' && <SelectItem value="full">Plein écran</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Width
    if (key === 'width') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Petite</SelectItem>
              <SelectItem value="md">Moyenne</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
              <SelectItem value="full">Pleine largeur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Columns
    if (key === 'columns') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={String(value)} onValueChange={(v) => handleChange(key, Number(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 colonne</SelectItem>
              <SelectItem value="2">2 colonnes</SelectItem>
              <SelectItem value="3">3 colonnes</SelectItem>
              <SelectItem value="4">4 colonnes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Style (divider/list)
    if (key === 'style') {
      const isDivider = component.type === 'divider';
      const isList = component.type === 'list';

      if (isDivider) {
        return (
          <div key={key} className="space-y-2">
            <Label>{formatLabel(key)}</Label>
            <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solide</SelectItem>
                <SelectItem value="dashed">Tirets</SelectItem>
                <SelectItem value="dotted">Pointillés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      }

      if (isList) {
        return (
          <div key={key} className="space-y-2">
            <Label>{formatLabel(key)}</Label>
            <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bullet">Puces</SelectItem>
                <SelectItem value="number">Numéros</SelectItem>
                <SelectItem value="check">Coches</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      }
    }

    // Size
    if (key === 'size') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Petit</SelectItem>
              <SelectItem value="md">Moyen</SelectItem>
              <SelectItem value="lg">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Aspect Ratio
    if (key === 'aspectRatio') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Paysage)</SelectItem>
              <SelectItem value="4:3">4:3 (Standard)</SelectItem>
              <SelectItem value="1:1">1:1 (Carré)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Padding
    if (key === 'padding') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="sm">Petit</SelectItem>
              <SelectItem value="md">Moyen</SelectItem>
              <SelectItem value="lg">Grand</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Background Type
    if (key === 'backgroundType') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Couleur unie</SelectItem>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="gradient">Dégradé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    // Color picker
    if (key.toLowerCase().includes('color')) {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={(value as string) || '#000000'}
              onChange={(e) => handleChange(key, e.target.value)}
              className="h-10 w-14 cursor-pointer p-1"
            />
            <Input
              value={value as string}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>
      );
    }

    // Number input
    if (typeof value === 'number') {
      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{formatLabel(key)}</Label>
          <Input
            id={key}
            type="number"
            value={value}
            onChange={(e) => handleChange(key, Number(e.target.value))}
          />
        </div>
      );
    }

    // Default text input
    return (
      <div key={key} className="space-y-2">
        <Label htmlFor={key}>{formatLabel(key)}</Label>
        <Input
          id={key}
          value={value as string}
          onChange={(e) => handleChange(key, e.target.value)}
        />
      </div>
    );
  };

  // Categorize props
  const contentProps: [string, unknown][] = [];
  const styleProps: [string, unknown][] = [];
  const optionsProps: [string, unknown][] = [];

  Object.entries(component.props).forEach(([key, value]) => {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return;

    // Style props: colors, alignment, background
    if (key.toLowerCase().includes('color') || key === 'backgroundType' || key === 'backgroundImage' || key.toLowerCase().includes('alignment')) {
      styleProps.push([key, value]);
    }
    // Options props: dimensions, layout, toggles
    else if (typeof value === 'boolean' || key === 'columns' || key === 'limit' || key === 'height' || key === 'gap' || key === 'width' || key === 'size' || key === 'style' || key === 'aspectRatio' || key === 'padding' || key === 'rounded' || key === 'overlay') {
      optionsProps.push([key, value]);
    }
    // Content props: text, links, etc.
    else {
      contentProps.push([key, value]);
    }
  });

  // Determine which sections to show
  const hasContent = contentProps.length > 0;
  const hasStyle = styleProps.length > 0;
  const hasOptions = optionsProps.length > 0;

  // Default open sections
  const defaultOpen = [];
  if (hasContent) defaultOpen.push('content');
  if (hasStyle) defaultOpen.push('style');

  return (
    <div className="absolute right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-card shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <div>
          <h3 className="font-semibold text-sm">{definition?.label || component.type}</h3>
          <p className="text-xs text-muted-foreground">Modifier le composant</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={defaultOpen} className="px-3 py-2">
          {hasContent && (
            <AccordionItem value="content" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2 text-sm">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <span>Contenu</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  {contentProps.map(([key, value]) => renderField(key, value))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasStyle && (
            <AccordionItem value="style" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2 text-sm">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span>Style</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  {styleProps.map(([key, value]) => renderField(key, value))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasOptions && (
            <AccordionItem value="options" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>Options</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pb-2">
                  {optionsProps.map(([key, value]) => renderField(key, value))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
