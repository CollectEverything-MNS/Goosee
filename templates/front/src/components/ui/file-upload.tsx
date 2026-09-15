'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<{ url: string }>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function FileUpload({
  value,
  onChange,
  onUpload,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.ico'],
  },
  maxSize = 5 * 1024 * 1024,
  disabled = false,
  placeholder = 'Glissez une image ou cliquez pour sélectionner',
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setIsUploading(true);

      try {
        const result = await onUpload(file);
        onChange(result.url);
      } catch (err) {
        setError('Erreur lors de l\'upload');
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: disabled || isUploading,
    multiple: false,
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer',
          isDragActive && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !value && 'hover:border-primary/50',
          error && 'border-destructive'
        )}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Upload en cours...</p>
          </div>
        ) : value ? (
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                {value.match(/\.(ico|svg)$/i) ? (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <img
                    src={value}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value.split('/').pop()}</p>
                <p className="text-xs text-muted-foreground truncate">{value}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Retirer le fichier"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {isDragActive ? 'Déposez le fichier ici' : placeholder}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Max {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
