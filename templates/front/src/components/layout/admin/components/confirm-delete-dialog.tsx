'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  title: string;
  description: React.ReactNode;
  cancelLabel: string;
  confirmLabel: string;
}

export function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
  title,
  description,
  cancelLabel,
  confirmLabel,
}: Props) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[480px]">
        <AlertDialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <AlertDialogTitle className="text-base font-semibold">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-xs">{description}</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
          <AlertDialogCancel onClick={onClose} disabled={isPending} className="mt-0">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="gap-2 bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
