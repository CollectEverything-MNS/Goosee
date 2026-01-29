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
import { useUploadFile } from '@/features/personnalisation/settings/usecases/use-upload-file'
import { Palette, Settings, Type, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PageBuilderComponentEditorProps {
  component: PageComponent
  onUpdate: (props: Record<string, unknown>) => void
  onClose: () => void
}

export function PageBuilderComponentEditor({
  component,
  onUpdate,
  onClose,
}: PageBuilderComponentEditorProps) {
  const tComponents = useTranslations('admin.pageBuilder.components')
  const tEditor = useTranslations('admin.pageBuilder.editor')
  const tLabels = useTranslations('admin.pageBuilder.editor.labels')
  const tOptions = useTranslations('admin.pageBuilder.editor.options')
  const uploadMutation = useUploadFile()

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

  const formatLabel = (key: string): string => {
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

    if (IMAGE_FIELD_KEYS.includes(key)) {
      return (
        <div key={key} className="space-y-2">
          <Label>{formatLabel(key)}</Label>
          <FileUpload
            value={value as string}
            onChange={(url) => handleChange(key, url)}
            onUpload={(file) => handleUpload(file, 'pages')}
            accept={{
              'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
            }}
            placeholder={tEditor('uploadImage')}
          />
        </div>
      )
    }

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
              <SelectItem value="h1">{tOptions('level.h1')}</SelectItem>
              <SelectItem value="h2">{tOptions('level.h2')}</SelectItem>
              <SelectItem value="h3">{tOptions('level.h3')}</SelectItem>
              <SelectItem value="h4">{tOptions('level.h4')}</SelectItem>
              <SelectItem value="h5">{tOptions('level.h5')}</SelectItem>
              <SelectItem value="h6">{tOptions('level.h6')}</SelectItem>
            </SelectContent>
          </Select>
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

  Object.entries(component.props).forEach(([key, value]) => {
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) return

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
    <div className="absolute right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-card shadow-lg">
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

      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={defaultOpen} className="px-3 py-2">
          {hasContent && (
            <AccordionItem value="content" className="border-b-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2 text-sm">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <span>{tEditor('sections.content')}</span>
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
                  <span>{tEditor('sections.style')}</span>
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
                  <span>{tEditor('sections.options')}</span>
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
  )
}
