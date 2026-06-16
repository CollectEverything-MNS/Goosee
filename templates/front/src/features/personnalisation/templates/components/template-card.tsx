'use client';

import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import type { TemplateCategory, TemplateDefinition } from '../data';
import { useApplyTemplate } from '../usecases/use-apply-template';

import { TemplatePreviewArt } from './template-preview-art';

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  drive: 'Drive',
  bakery: 'Boulangerie',
  restaurant: 'Restaurant',
  beauty: 'Beauté',
};

interface Props {
  template: TemplateDefinition;
  onApplied?: () => void;
}

export function TemplateCard({ template, onApplied }: Props) {
  const applyMutation = useApplyTemplate();
  const [open, setOpen] = useState(false);

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync(template);
      toast.success('Template appliqué avec succès');
      setOpen(false);
      onApplied?.();
    } catch (err: any) {
      console.error('Erreur apply template:', err);
      const msg = err?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(', ') : msg || "Erreur lors de l'application du template"
      );
    }
  };

  const accent = template.accentColor;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden border-b border-border">
        <TemplatePreviewArt category={template.category} accent={accent} name={template.name} />
        <div className="pointer-events-none absolute right-3 top-3">
          <span
            className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm backdrop-blur"
            style={{ color: accent }}
          >
            {CATEGORY_LABEL[template.category]}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
          <p className="line-clamp-3 text-sm text-muted-foreground">{template.description}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {template.pages.length} pages · {template.menus.length} entrées de menu
        </div>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full" disabled={applyMutation.isPending}>
              {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Appliquer ce template
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Appliquer « {template.name} » ?</AlertDialogTitle>
              <AlertDialogDescription>
                Toutes les pages et entrées de menu existantes seront supprimées et remplacées par
                celles du template. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={applyMutation.isPending}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="bg-foreground hover:bg-foreground/90"
              >
                {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
