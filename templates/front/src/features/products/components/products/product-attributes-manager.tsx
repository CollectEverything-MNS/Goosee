'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useAddProductAttribute,
  useDeleteProductAttribute,
  useProductAttributes,
} from '../../usecases/use-product-attributes';

export function ProductAttributesManager({ productId }: { productId: string }) {
  const tA11y = useTranslations('admin.a11y');
  const { data: attributes = [], isLoading } = useProductAttributes(productId);
  const addMutation = useAddProductAttribute(productId);
  const deleteMutation = useDeleteProductAttribute(productId);

  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) {
      toast.error('Renseignez le nom et la valeur');
      return;
    }
    try {
      await addMutation.mutateAsync({ key: key.trim(), value: value.trim() });
      toast.success('Caractéristique ajoutée');
      setKey('');
      setValue('');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || "Erreur lors de l'ajout");
    }
  };

  const handleDelete = async (attributeId: string) => {
    try {
      await deleteMutation.mutateAsync(attributeId);
      toast.success('Caractéristique supprimée');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Suppression impossible');
    }
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : attributes.length > 0 ? (
        <ul className="space-y-2">
          {attributes.map((attr) => (
            <li
              key={attr.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2"
            >
              <div className="min-w-0 text-sm">
                <span className="font-medium">{attr.key}</span>
                <span className="text-muted-foreground"> : {attr.value}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(attr.id)}
                disabled={deleteMutation.isPending}
                aria-label={`Supprimer la caractéristique ${attr.key}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">Aucune caractéristique pour le moment.</p>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="attribute-key" className="text-[11px] font-medium text-muted-foreground">Nom</label>
          <Input
            id="attribute-key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Poids, Allergènes..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd(e);
            }}
          />
        </div>
        <div className="flex-1 space-y-1">
          <label htmlFor="attribute-value" className="text-[11px] font-medium text-muted-foreground">Valeur</label>
          <Input
            id="attribute-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="250 g, Gluten..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd(e);
            }}
          />
        </div>
        <Button
          type="button"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleAdd}
          disabled={addMutation.isPending}
          aria-label={tA11y('addAttribute')}
        >
          {addMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
