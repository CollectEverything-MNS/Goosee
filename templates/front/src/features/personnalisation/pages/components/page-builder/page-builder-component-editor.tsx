'use client';

import { PageComponent, COMPONENT_DEFINITIONS } from '../../types/page.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

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

  const renderField = (key: string, value: unknown) => {
    if (typeof value === 'string') {
      if (key.toLowerCase().includes('content') || key.toLowerCase().includes('description')) {
        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{formatLabel(key)}</Label>
            <Textarea
              id={key}
              value={value}
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

      if (key.toLowerCase().includes('variant')) {
        return (
          <div key={key} className="space-y-2">
            <Label>{formatLabel(key)}</Label>
            <Select value={value} onValueChange={(v) => handleChange(key, v)}>
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

      if (key.toLowerCase().includes('height') || key.toLowerCase().includes('gap')) {
        return (
          <div key={key} className="space-y-2">
            <Label>{formatLabel(key)}</Label>
            <Select value={value} onValueChange={(v) => handleChange(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Petit</SelectItem>
                <SelectItem value="md">Moyen</SelectItem>
                <SelectItem value="lg">Grand</SelectItem>
                <SelectItem value="xl">Très grand</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      }

      return (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{formatLabel(key)}</Label>
          <Input
            id={key}
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
          />
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

    if (typeof value === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-2">
          <input
            id={key}
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor={key}>{formatLabel(key)}</Label>
        </div>
      );
    }

    return null;
  };

  const formatLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="w-80 border-l bg-card">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-semibold">{definition?.label || component.type}</h3>
          <p className="text-xs text-muted-foreground">Modifier les propriétés</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%-80px)]">
        <div className="space-y-4 p-4">
          {Object.entries(component.props).map(([key, value]) => {
            if (Array.isArray(value)) return null;
            if (typeof value === 'object' && value !== null) return null;
            return renderField(key, value);
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
