'use client';

import { isAxiosError } from 'axios';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useUser } from '../context/users-provider';
import { useCreateUser } from '../usecases/use-create-user';
import { useUpdateUser } from '../usecases/use-update-user';
import { ROLES_LIST } from '../data/roles.data';

const ROLES = ['OWNER', 'SUPERADMIN', 'ADMIN', 'CUSTOMER'] as const;

const formSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().min(6).max(20).optional().or(z.literal('')),
  role: z.enum(ROLES),
});

type FormValues = z.infer<typeof formSchema>;

export function UserFormDialog() {
  const t = useTranslations('admin.users');
  const { open, setOpen, currentRow, setCurrentRow } = useUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const isEditing = open === 'edit' && !!currentRow;
  const isOpen = open === 'create' || open === 'edit';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', firstName: '', lastName: '', phone: '', role: 'ADMIN' },
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        email: currentRow.email ?? '',
        firstName: currentRow.firstName ?? '',
        lastName: currentRow.lastName ?? '',
        phone: currentRow.phone ?? '',
        role: currentRow.role?.[0] ?? 'ADMIN',
      });
    } else if (open === 'create') {
      form.reset({ email: '', firstName: '', lastName: '', phone: '', role: 'ADMIN' });
    }
  }, [open, currentRow, isEditing, form]);

  const handleClose = () => {
    form.reset();
    setCurrentRow(null);
    setOpen(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: currentRow.id,
          data: {
            email: values.email,
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || undefined,
            role: [values.role],
          },
        });
        toast.success(t('form.updateSuccess'));
      } else {
        await createMutation.mutateAsync({
          email: values.email,
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone || undefined,
          role: [values.role],
        });
        toast.success(t('form.createSuccess'));
      }
      handleClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        toast.error(isEditing ? t('form.updateError') : t('form.createError'));
      }
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.firstName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.firstNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.lastName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.lastNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="user@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.phone')}</FormLabel>
                  <FormControl>
                    <Input placeholder="+33612345678" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.role')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.rolePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLES_LIST.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isEditing ? t('form.update') : t('form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
