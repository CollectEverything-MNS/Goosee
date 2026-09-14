'use client'

import { COMPONENT_DEFINITIONS, PageComponent } from '../../types/page.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUploadFile } from '@/features/personnalisation/settings/usecases/use-upload-file'
import { useListCategories } from '@/features/products/usecases/use-list-categories'
import { Link2, Palette, Settings, Type, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { ListField } from './list-field'

const LIST_FIELD_KEYS = ['products', 'testimonials', 'features'] as const
type ListFieldComponentType = 'featured-products' | 'testimonials' | 'features'

// Niveau de titre le plus profond que chaque type de bloc utilise deja par lui-meme,
// pour eviter qu'un bloc "Titre" propose un niveau qui creerait un saut (ex: h2 -> h4).
const HEADING_BASELINE: Partial<Record<string, number>> = {
  hero: 1,
  'featured-products': 3,
  testimonials: 2,
  banner: 2,
  features: 3,
  contact: 3,
}

function getMaxHeadingLevelBefore(allComponents: PageComponent[], currentId: string): number {
  let max = 1 // un h1 est toujours present sur la page (bloc Hero ou titre de secours)
  const sorted = [...allComponents].sort((a, b) => a.order - b.order)
  for (const c of sorted) {
    if (c.id === currentId) break
    if (c.type === 'heading') {
      const level = Number(((c.props?.level as string) || 'h2').replace('h', ''))
      if (!Number.isNaN(level)) max = Math.max(max, level)
    } else if (HEADING_BASELINE[c.type]) {
      max = Math.max(max, HEADING_BASELINE[c.type]!)
    }
  }
  return max
}

function ImageField({
  label,
  value,
  onChange,
  onUpload,
  uploadPlaceholder,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<{ url: string }>
  uploadPlaceholder: string
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label className="text-xs font-medium">{label}</Label>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border bg-background p-2">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Input
              type="url"
              placeholder="https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange('')}
            title="Retirer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="https://..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-10"
          />
          <FileUpload
            value=""
            onChange={onChange}
            onUpload={onUpload}
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'] }}
            placeholder={uploadPlaceholder}
          />
        </div>
      )}
    </div>
  )
}

interface PageBuilderComponentEditorProps {
  component: PageComponent
  allComponents: PageComponent[]
  onUpdate: (props: Record<string, unknown>) => void
  onClose: () => void
  embedded?: boolean
}

export function PageBuilderComponentEditor({
  component,
  allComponents,
  onUpdate,
  onClose,
  embedded = false,
}: PageBuilderComponentEditorProps) {
  const tComponents = useTranslations('admin.pageBuilder.components')
  const tEditor = useTranslations('admin.pageBuilder.editor')
  const tLabels = useTranslations('admin.pageBuilder.editor.labels')
  const tOptions = useTranslations('admin.pageBuilder.editor.options')
  const uploadMutation = useUploadFile()
  const { data: categories = [] } = useListCategories()

  const definition = COMPONENT_DEFINITIONS.find((d) => d.type === component.type)
  const componentLabel = tComponents(component.type as never)

  const handleChange = (key: string, value: unknown) => {
    onUpdate({ [key]: value })
  }

  const handleUpload = async (file: File, folder: string) => {
    const result = await uploadMutation.mutateAsync({ file, folder })
    return result
  }

  const IMAGE_FIELD_KEYS = ['src', 'backgroundImage']

  const LABEL_OVERRIDES: Record<string, string> = {
    categoryId: 'Catégorie',
    limit: 'Nombre de produits',
    sort: 'Tri',
    availableOnly: 'Produits disponibles uniquement',
  }

  const formatLabel = (key: string): string => {
    if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key]
    try {
      return tLabels(key as never)
    } catch {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim()
    }
  }

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
      )
    }

    if (typeof value !== 'string' && typeof value !== 'number') return null

    // Selecteur de categorie (filtre les produits affiches par ce bloc)
    if (key === 'categoryId') {
      const ALL = '__all__'
      return (
        <div key={key} className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={value ? (value as string) : ALL}
            onValueChange={(v) => handleChange(key, v === ALL ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Toutes les catégories</SelectItem>
              {(categories as Array<{ id: string; name: string }>).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Affiche uniquement les produits de cette catégorie.
          </p>
        </div>
      )
    }

    // Tri des produits affiches par le bloc
    if (key === 'sort') {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={(value as string) || 'recent'} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    if ((LIST_FIELD_KEYS as readonly string[]).includes(key) && typeof value === 'string') {
      const listType = component.type as ListFieldComponentType
      return (
        <ListField
          key={key}
          label={formatLabel(key)}
          value={value}
          onChange={(v) => handleChange(key, v)}
          componentType={listType}
        />
      )
    }

    if (IMAGE_FIELD_KEYS.includes(key)) {
      return (
        <ImageField
          key={key}
          label={formatLabel(key)}
          value={value as string}
          onChange={(url) => handleChange(key, url)}
          onUpload={(file) => handleUpload(file, 'pages')}
          uploadPlaceholder={tEditor('uploadImage')}
        />
      )
    }

    // Level (h2-h6, jamais h1 : reserve au bloc Hero / au titre de la page)
    if (key === 'level') {
      const maxBefore = getMaxHeadingLevelBefore(allComponents, component.id)
      const maxAllowed = Math.min(maxBefore + 1, 6)
      const availableLevels = [2, 3, 4, 5, 6].filter((l) => l <= maxAllowed)

      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableLevels.map((l) => (
                <SelectItem key={l} value={`h${l}`}>
                  {tOptions(`level.h${l}` as never)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Seuls les niveaux qui ne sautent pas d&apos;étape par rapport aux titres déjà présents plus haut sur la page sont proposés.
          </p>
        </div>
      )
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
      )
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
              <SelectItem value="left">{tOptions('alignment.left')}</SelectItem>
              <SelectItem value="center">{tOptions('alignment.center')}</SelectItem>
              <SelectItem value="right">{tOptions('alignment.right')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="primary">{tOptions('variant.primary')}</SelectItem>
              <SelectItem value="secondary">{tOptions('variant.secondary')}</SelectItem>
              <SelectItem value="outline">{tOptions('variant.outline')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="sm">{tOptions('size.sm')}</SelectItem>
              <SelectItem value="md">{tOptions('size.md')}</SelectItem>
              <SelectItem value="lg">{tOptions('size.lg')}</SelectItem>
              <SelectItem value="xl">{tOptions('size.xl')}</SelectItem>
              {key === 'height' && <SelectItem value="full">{tOptions('size.full')}</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="sm">{tOptions('width.sm')}</SelectItem>
              <SelectItem value="md">{tOptions('width.md')}</SelectItem>
              <SelectItem value="lg">{tOptions('width.lg')}</SelectItem>
              <SelectItem value="full">{tOptions('width.full')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="1">{tOptions('columns.1')}</SelectItem>
              <SelectItem value="2">{tOptions('columns.2')}</SelectItem>
              <SelectItem value="3">{tOptions('columns.3')}</SelectItem>
              <SelectItem value="4">{tOptions('columns.4')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    // Style (divider/list)
    if (key === 'style') {
      const isDivider = component.type === 'divider'
      const isList = component.type === 'list'

      if (isDivider) {
        return (
          <div key={key} className="space-y-2">
            <Label>{formatLabel(key)}</Label>
            <Select value={value as string} onValueChange={(v) => handleChange(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">{tOptions('dividerStyle.solid')}</SelectItem>
                <SelectItem value="dashed">{tOptions('dividerStyle.dashed')}</SelectItem>
                <SelectItem value="dotted">{tOptions('dividerStyle.dotted')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
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
                <SelectItem value="bullet">{tOptions('listStyle.bullet')}</SelectItem>
                <SelectItem value="number">{tOptions('listStyle.number')}</SelectItem>
                <SelectItem value="check">{tOptions('listStyle.check')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
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
              <SelectItem value="sm">{tOptions('size.sm')}</SelectItem>
              <SelectItem value="md">{tOptions('size.md')}</SelectItem>
              <SelectItem value="lg">{tOptions('size.lg')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="16:9">{tOptions('aspectRatio.16:9')}</SelectItem>
              <SelectItem value="4:3">{tOptions('aspectRatio.4:3')}</SelectItem>
              <SelectItem value="1:1">{tOptions('aspectRatio.1:1')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="none">{tOptions('padding.none')}</SelectItem>
              <SelectItem value="sm">{tOptions('padding.sm')}</SelectItem>
              <SelectItem value="md">{tOptions('padding.md')}</SelectItem>
              <SelectItem value="lg">{tOptions('padding.lg')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
              <SelectItem value="color">{tOptions('backgroundType.color')}</SelectItem>
              <SelectItem value="image">{tOptions('backgroundType.image')}</SelectItem>
              <SelectItem value="gradient">{tOptions('backgroundType.gradient')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
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
      )
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
      )
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
    )
  }

  // Categorize props
  const contentProps: [string, unknown][] = []
  const styleProps: [string, unknown][] = []
  const optionsProps: [string, unknown][] = []

  const currentBackgroundType = component.props.backgroundType as string | undefined;
  // Fusionne les props par defaut de la definition pour que les champs ajoutes
  // (ex. filtres produits) apparaissent aussi sur les blocs deja enregistres.
  const mergedProps = { ...(definition?.defaultProps ?? {}), ...component.props };
  const propsEntries = Object.entries(mergedProps);

  if (currentBackgroundType === 'image' && !('backgroundImage' in component.props)) {
    propsEntries.push(['backgroundImage', '']);
  }

  propsEntries.forEach(([key, value]) => {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return

    if (key === 'backgroundImage' && currentBackgroundType !== 'image') return

    // Style props: colors, alignment, background
    if (
      key.toLowerCase().includes('color') ||
      key === 'backgroundType' ||
      key === 'backgroundImage' ||
      key.toLowerCase().includes('alignment')
    ) {
      styleProps.push([key, value])
    }
    // Options props: dimensions, layout, toggles
    else if (
      typeof value === 'boolean' ||
      key === 'columns' ||
      key === 'limit' ||
      key === 'categoryId' ||
      key === 'sort' ||
      key === 'height' ||
      key === 'gap' ||
      key === 'width' ||
      key === 'size' ||
      key === 'style' ||
      key === 'aspectRatio' ||
      key === 'padding' ||
      key === 'rounded' ||
      key === 'overlay'
    ) {
      optionsProps.push([key, value])
    }
    // Content props: text, links, etc.
    else {
      contentProps.push([key, value])
    }
  })

  // Determine which sections to show
  const hasContent = contentProps.length > 0
  const hasStyle = styleProps.length > 0
  const hasOptions = optionsProps.length > 0

  // Default open sections
  const defaultOpen = []
  if (hasContent) defaultOpen.push('content')
  if (hasStyle) defaultOpen.push('style')

  return (
    <div
      className={
        embedded
          ? 'flex h-full flex-col bg-background'
          : 'absolute right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-card shadow-lg'
      }
    >
      {!embedded && (
        <div className="flex items-center justify-between border-b p-3">
          <div>
            <h3 className="text-sm font-semibold">
              {componentLabel || definition?.label || component.type}
            </h3>
            <p className="text-xs text-muted-foreground">{tEditor('editComponent')}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={defaultOpen} className="divide-y divide-border">
          {hasContent && (
            <AccordionItem value="content" className="border-b-0">
              <AccordionTrigger className="px-5 py-3 hover:bg-muted/40 hover:no-underline data-[state=open]:bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Type className="h-3.5 w-3.5" />
                  <span>{tEditor('sections.content')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 px-5 pb-5 pt-2">
                  {contentProps.map(([key, value]) => renderField(key, value))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasStyle && (
            <AccordionItem value="style" className="border-b-0">
              <AccordionTrigger className="px-5 py-3 hover:bg-muted/40 hover:no-underline data-[state=open]:bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Palette className="h-3.5 w-3.5" />
                  <span>{tEditor('sections.style')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 px-5 pb-5 pt-2">
                  {styleProps.map(([key, value]) => renderField(key, value))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {hasOptions && (
            <AccordionItem value="options" className="border-b-0">
              <AccordionTrigger className="px-5 py-3 hover:bg-muted/40 hover:no-underline data-[state=open]:bg-muted/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Settings className="h-3.5 w-3.5" />
                  <span>{tEditor('sections.options')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 px-5 pb-5 pt-2">
                  {optionsProps.map(([key, value]) => renderField(key, value))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </ScrollArea>
    </div>
  )
}
