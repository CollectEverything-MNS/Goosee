'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { CheckCircle2, Loader2, Star, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  useAddProductImage,
  useDeleteProductImage,
  useProductImages,
  useSetMainProductImage,
} from '../../usecases/use-product-images';

const MAX_SIZE = 5 * 1024 * 1024;

export function ProductImagesManager({ productId }: { productId: string }) {
  const tA11y = useTranslations('admin.a11y');
  const { data: images = [], isLoading } = useProductImages(productId);
  const addMutation = useAddProductImage(productId);
  const deleteMutation = useDeleteProductImage(productId);
  const setMainMutation = useSetMainProductImage(productId);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      try {
        for (const file of acceptedFiles) {
          await addMutation.mutateAsync({ file });
        }
        toast.success(
          acceptedFiles.length > 1
            ? `${acceptedFiles.length} images ajoutées`
            : 'Image ajoutée',
        );
      } catch (err: any) {
        const msg = err?.response?.data?.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg || "Erreur lors de l'upload");
      } finally {
        setUploading(false);
      }
    },
    [addMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    maxSize: MAX_SIZE,
    disabled: uploading,
  });

  const handleDelete = async (imageId: string) => {
    try {
      await deleteMutation.mutateAsync(imageId);
      toast.success('Image supprimée');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Suppression impossible');
    }
  };

  const handleSetMain = async (imageId: string) => {
    try {
      await setMainMutation.mutateAsync(imageId);
      toast.success('Image principale définie');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Action impossible');
    }
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                image.isMain && 'ring-2 ring-primary ring-offset-1',
              )}
            >
              <img src={image.url} alt="" className="h-full w-full object-cover" />

              {image.isMain && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  <CheckCircle2 className="h-3 w-3" /> Principale
                </span>
              )}

              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.isMain && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    title="Définir comme principale"
                    aria-label={tA11y('setMainImage')}
                    onClick={() => handleSetMain(image.id)}
                    disabled={setMainMutation.isPending}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  title="Supprimer"
                  aria-label={tA11y('deleteImage')}
                  onClick={() => handleDelete(image.id)}
                  disabled={deleteMutation.isPending || images.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Aucune image pour ce produit.</p>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-6 transition-colors',
          isDragActive && 'border-primary bg-primary/5',
          uploading && 'pointer-events-none opacity-60',
          'hover:border-primary/50',
        )}
      >
        <input {...getInputProps()} aria-label={tA11y('addImages')} />
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Upload en cours...</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              {isDragActive ? 'Déposez les images ici' : 'Glissez des images ou cliquez'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP — max 5MB</p>
          </>
        )}
      </div>
    </div>
  );
}
