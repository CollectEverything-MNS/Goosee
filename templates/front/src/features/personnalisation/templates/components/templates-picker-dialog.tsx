'use client';

import { LayoutTemplate } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AVAILABLE_TEMPLATES } from '../data';
import { TemplateCard } from './template-card';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatesPickerDialog({ open, onOpenChange }: Props) {
  const handleApplied = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#facc15]/10 text-[#a16207]">
              <LayoutTemplate className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">Choisir un template</DialogTitle>
              <DialogDescription className="text-xs">
                Démarrez vite avec un site clé en main. Appliquer un template remplace toutes les
                pages existantes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_TEMPLATES.map((template) => (
              <TemplateCard key={template.id} template={template} onApplied={handleApplied} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
