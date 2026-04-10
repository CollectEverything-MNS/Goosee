'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ShoppingCart, FileText, Loader2 } from 'lucide-react';
import { TemplateDefinition } from '../data/drive-template';
import { useApplyTemplate } from '../usecases/use-apply-template';
import { toast } from 'sonner';
import { useState } from 'react';

interface Props {
  template: TemplateDefinition;
}

export function TemplateCard({ template }: Props) {
  const applyMutation = useApplyTemplate();
  const [open, setOpen] = useState(false);

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync(template);
      toast.success('Template appliqué avec succès');
      setOpen(false);
    } catch (err: any) {
      console.error('Erreur apply template:', err);
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || "Erreur lors de l'application du template");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
        <ShoppingCart className="h-16 w-16 text-white/80" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Drive
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{template.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          {template.pages.length} pages, {template.menus.length} entrées de menu
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
              <AlertDialogTitle>Appliquer le template &quot;{template.name}&quot; ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va supprimer toutes les pages et menus existants et les remplacer par ceux du template.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={applyMutation.isPending}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleApply} disabled={applyMutation.isPending}>
                {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
