'use client';

import { useMemo } from 'react';
import {
  ChevronDown,
  Clock,
  GripVertical,
  Headphones,
  Heart,
  Leaf,
  Lock,
  Plus,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Undo,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'textarea' | 'number' | 'icon' | 'rating' | 'url';

interface FieldSpec {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

interface SchemaSpec {
  fields: FieldSpec[];
  titleKey: string; // The field used as the item title shown in the collapsed view
  fallback: string; // Default title if the title field is empty
  newItem: () => Record<string, unknown>;
}

const ICON_OPTIONS = [
  { value: 'truck', label: 'Camion', Icon: Truck },
  { value: 'undo', label: 'Retour', Icon: Undo },
  { value: 'lock', label: 'Cadenas', Icon: Lock },
  { value: 'headphones', label: 'Support', Icon: Headphones },
  { value: 'shield', label: 'Bouclier', Icon: Shield },
  { value: 'clock', label: 'Horloge', Icon: Clock },
  { value: 'heart', label: 'Cœur', Icon: Heart },
  { value: 'zap', label: 'Éclair', Icon: Zap },
  { value: 'leaf', label: 'Feuille', Icon: Leaf },
  { value: 'star', label: 'Étoile', Icon: Star },
  { value: 'sparkles', label: 'Étincelles', Icon: Sparkles },
] as const;

interface ListFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  componentType: 'featured-products' | 'testimonials' | 'features';
}

export function ListField({ label, value, onChange, componentType }: ListFieldProps) {
  const t = useTranslations('admin.pageBuilder.editor.lists');
  const schema = useSchema(componentType);

  const items = useMemo<Record<string, unknown>[]>(() => {
    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [value]);

  const setItems = (next: Record<string, unknown>[]) => {
    onChange(JSON.stringify(next));
  };

  const updateItem = (index: number, key: string, fieldValue: unknown) => {
    const next = items.map((it, i) => (i === index ? { ...it, [key]: fieldValue } : it));
    setItems(next);
  };

  const addItem = () => setItems([...items, schema.newItem()]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const moveItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>

      <div className="space-y-2">
        {items.length === 0 && (
          <div className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
            {t('empty')}
          </div>
        )}
        {items.map((item, index) => (
          <ItemCard
            key={index}
            index={index}
            item={item}
            schema={schema}
            isFirst={index === 0}
            isLast={index === items.length - 1}
            onUpdate={(key, fieldValue) => updateItem(index, key, fieldValue)}
            onRemove={() => removeItem(index)}
            onMoveUp={() => moveItem(index, -1)}
            onMoveDown={() => moveItem(index, 1)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addItem}
        className="h-9 w-full gap-2 border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        {t('addItem')}
      </Button>
    </div>
  );
}

function ItemCard({
  index,
  item,
  schema,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  item: Record<string, unknown>;
  schema: SchemaSpec;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (key: string, value: unknown) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const title = (item[schema.titleKey] as string | undefined)?.trim() || `${schema.fallback} ${index + 1}`;

  return (
    <Collapsible defaultOpen={index === 0} className="overflow-hidden rounded-md border border-border bg-card">
      <CollapsibleTrigger className="group/item flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/40">
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-medium">{title}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/item:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 border-t border-border px-3 py-3">
          {schema.fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={item[field.key]}
              onChange={(v) => onUpdate(field.key, v)}
            />
          ))}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                disabled={isFirst}
                title="Monter"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                disabled={isLast}
                title="Descendre"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Supprimer
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const v = (value ?? '') as string | number;

  if (field.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <Textarea
          rows={3}
          value={String(v)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <Input
          type="number"
          value={typeof v === 'number' ? v : Number(v) || 0}
          placeholder={field.placeholder}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-9"
        />
      </div>
    );
  }

  if (field.type === 'rating') {
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = Number(v) >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className="rounded p-1 hover:bg-muted"
                aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
              >
                <Star
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30',
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === 'icon') {
    const current = ICON_OPTIONS.find((opt) => opt.value === v);
    const CurrentIcon = current?.Icon;
    return (
      <div className="space-y-1.5">
        <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {field.label}
        </Label>
        <Select value={String(v)} onValueChange={onChange}>
          <SelectTrigger className="h-9">
            <SelectValue>
              {current ? (
                <div className="flex items-center gap-2">
                  {CurrentIcon && <CurrentIcon className="h-4 w-4" />}
                  <span>{current.label}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Choisir une icône</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ICON_OPTIONS.map(({ value, label, Icon }) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {field.label}
      </Label>
      <Input
        type={field.type === 'url' ? 'url' : 'text'}
        value={String(v)}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-9"
      />
    </div>
  );
}

function useSchema(componentType: ListFieldProps['componentType']): SchemaSpec {
  const t = useTranslations('admin.pageBuilder.editor.lists');

  return useMemo<SchemaSpec>(() => {
    if (componentType === 'featured-products') {
      return {
        titleKey: 'name',
        fallback: t('product.fallback'),
        fields: [
          { key: 'name', label: t('product.name'), type: 'text', placeholder: t('product.namePlaceholder') },
          { key: 'price', label: t('product.price'), type: 'text', placeholder: '29,99 €' },
          { key: 'image', label: t('product.image'), type: 'url', placeholder: 'https://...' },
          { key: 'link', label: t('product.link'), type: 'url', placeholder: '/produit/...' },
        ],
        newItem: () => ({ name: t('product.fallback'), price: '0 €', image: '', link: '#' }),
      };
    }
    if (componentType === 'testimonials') {
      return {
        titleKey: 'name',
        fallback: t('testimonial.fallback'),
        fields: [
          { key: 'name', label: t('testimonial.name'), type: 'text', placeholder: t('testimonial.namePlaceholder') },
          { key: 'text', label: t('testimonial.text'), type: 'textarea', placeholder: t('testimonial.textPlaceholder') },
          { key: 'rating', label: t('testimonial.rating'), type: 'rating' },
        ],
        newItem: () => ({ name: '', text: '', rating: 5 }),
      };
    }
    // features
    return {
      titleKey: 'title',
      fallback: t('feature.fallback'),
      fields: [
        { key: 'icon', label: t('feature.icon'), type: 'icon' },
        { key: 'title', label: t('feature.title'), type: 'text', placeholder: t('feature.titlePlaceholder') },
        { key: 'description', label: t('feature.description'), type: 'text', placeholder: t('feature.descriptionPlaceholder') },
      ],
      newItem: () => ({ icon: 'shield', title: '', description: '' }),
    };
  }, [componentType, t]);
}
