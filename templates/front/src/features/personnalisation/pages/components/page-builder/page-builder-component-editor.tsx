'use client';

import { COMPONENT_DEFINITIONS, PageComponent } from '../../types/page.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
  };

  const renderContentField = (key: string, value: unknown) => {
    if (typeof value !== 'string' && typeof value !== 'number') return null;

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
              <SelectItem value="cards">Cartes</SelectItem>
              <SelectItem value="icons">Icônes</SelectItem>
              <SelectItem value="list">Liste</SelectItem>
              <SelectItem value="grid">Grille</SelectItem>
              <SelectItem value="carousel">Carrousel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

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
            </SelectContent>
          </Select>
        </div>
      );
    }

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

  const renderStyleField = (key: string, value: unknown) => {
    if (typeof value !== 'string') return null;

    if (key.toLowerCase().includes('alignment')) {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value} onValueChange={(v) => handleChange(key, v)}>
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

    if (key === 'backgroundType') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value} onValueChange={(v) => handleChange(key, v)}>
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

    if (key.toLowerCase().includes('color')) {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleChange(key, e.target.value)}
              className="h-10 w-14 cursor-pointer p-1"
            />
            <Input
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>
      );
    }

    if (key === 'backgroundImage') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Input
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder="https://..."
          />
        </div>
      );
    }

    return null;
  };

  const renderBooleanField = (key: string, value: boolean) => {
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
  };

  const contentProps: [string, unknown][] = [];
  const styleProps: [string, unknown][] = [];
  const settingsProps: [string, unknown][] = [];

  Object.entries(component.props).forEach(([key, value]) => {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return;

    if (key.toLowerCase().includes('color') || key === 'backgroundType' || key === 'backgroundImage' || key.toLowerCase().includes('alignment')) {
      styleProps.push([key, value]);
    } else if (typeof value === 'boolean' || key === 'columns' || key === 'limit' || key === 'height' || key === 'gap' || key === 'width') {
      settingsProps.push([key, value]);
    } else {
      contentProps.push([key, value]);
    }
  });

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

      <Tabs defaultValue="content" className="flex flex-1 flex-col">
        <TabsList className="mx-3 mt-2 grid w-auto grid-cols-3">
          <TabsTrigger value="content" className="text-xs">
            <Type className="mr-1 h-3 w-3" />
            Contenu
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs">
            <Palette className="mr-1 h-3 w-3" />
            Style
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings className="mr-1 h-3 w-3" />
            Options
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="m-0 p-3">
            <div className="space-y-4">
              {contentProps.length > 0 ? (
                contentProps.map(([key, value]) => renderContentField(key, value))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun contenu à modifier</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="style" className="m-0 p-3">
            <div className="space-y-4">
              {styleProps.length > 0 ? (
                styleProps.map(([key, value]) => renderStyleField(key, value as string))
              ) : (
                <p className="text-sm text-muted-foreground">Aucun style disponible</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="m-0 p-3">
            <div className="space-y-4">
              {settingsProps.length > 0 ? (
                settingsProps.map(([key, value]) => {
                  if (typeof value === 'boolean') {
                    return renderBooleanField(key, value);
                  }
                  return renderContentField(key, value);
                })
              ) : (
                <p className="text-sm text-muted-foreground">Aucune option disponible</p>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
