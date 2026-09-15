import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function AdminModalSettingsAccountChangePasswordModal({ open, onOpenChange}: Props) {
  const t = useTranslations('admin.settings.account');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PasswordFormValues>();
  const newPassword = watch('newPassword');

  const onSubmit = (data: PasswordFormValues) => {
    console.log('Changement mot de passe:', data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('modifyPassword')}</DialogTitle>
          <DialogDescription>
            {t('passwordInstructions')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="account-current-password">{t('currentPassword')}</Label>
            <Input
              id="account-current-password"
              type="password"
              {...register('currentPassword', { required: t('required') })}
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="account-new-password">{t('newPassword')}</Label>
            <Input
              id="account-new-password"
              type="password"
              {...register('newPassword', { required: t('required') })}
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="account-confirm-password">{t('confirmPassword')}</Label>
            <Input
              id="account-confirm-password"
              type="password"
              {...register('confirmPassword', {
                required: t('required'),
                validate: (value) => value === newPassword || t('passwordMismatch')
              })}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit">{t('saveChanges')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
