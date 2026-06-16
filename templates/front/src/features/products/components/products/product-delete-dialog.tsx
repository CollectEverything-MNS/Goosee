'use client';

import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/layout/admin/components/confirm-delete-dialog';

import { useProduct } from '../../context/products-provider';
import { useDeleteProduct } from '../../usecases/use-delete-product';

export function ProductDeleteDialog() {
  const t = useTranslations('admin.products');
  const { open, setOpen, currentRow, setCurrentRow } = useProduct();
  const deleteMutation = useDeleteProduct();

  const isOpen = open === 'delete' && !!currentRow;

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  const handleConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(currentRow.id);
      toast.success(t('delete.success'));
      handleClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        toast.error(t('delete.error'));
      }
    }
  };

  return (
    <ConfirmDeleteDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isPending={deleteMutation.isPending}
      title={t('delete.title')}
      description={t('delete.description', { name: currentRow?.name ?? '' })}
      cancelLabel={t('delete.cancel')}
      confirmLabel={t('delete.confirm')}
    />
  );
}
