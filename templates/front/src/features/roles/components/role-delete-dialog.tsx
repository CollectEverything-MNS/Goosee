'use client';

import { isAxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { ConfirmDeleteDialog } from '@/components/layout/admin/components/confirm-delete-dialog';

import { useRoles } from '../context/roles-provider';
import { useDeleteRole } from '../usecases/use-delete-role';

export function RoleDeleteDialog() {
  const t = useTranslations('admin.roles');
  const { open, setOpen, currentRow, setCurrentRow } = useRoles();
  const deleteMutation = useDeleteRole();

  const isOpen = open === 'delete' && !!currentRow;

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  const handleConfirm = async () => {
    if (!currentRow) return;
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
