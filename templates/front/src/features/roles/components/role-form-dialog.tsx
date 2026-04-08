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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useRoles } from '../context/roles-provider';
import { useCreateRole } from '../usecases/use-create-role';
import { useUpdateRole } from '../usecases/use-update-role';
import { ADMIN_PAGE_GROUPS, ALL_PAGE_KEYS } from '../data/admin-pages';

const formSchema = z.object({
  name: z.string().min(2).max(64),
  description: z.string().max(255).optional().or(z.literal('')),
  pageKeys: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

export function RoleFormDialog() {
  const t = useTranslations('admin.roles');
  const { open, setOpen, currentRow, setCurrentRow } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const isEditing = open === 'edit' && !!currentRow;
  const isOpen = open === 'create' || open === 'edit';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '', pageKeys: [] },
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description ?? '',
        pageKeys: currentRow.pageKeys ?? [],
      });
    } else if (open === 'create') {
      form.reset({ name: '', description: '', pageKeys: [] });
    }
  }, [open, currentRow, isEditing, form]);

  const handleClose = () => {
    form.reset();
    setCurrentRow(null);
    setOpen(null);
  };

  const togglePage = (pageKey: string, currentValues: string[]) => {
    if (currentValues.includes(pageKey)) {
      return currentValues.filter((k) => k !== pageKey);
    }
    return [...currentValues, pageKey];
  };

  const toggleAll = (currentValues: string[]) => {
    return currentValues.length === ALL_PAGE_KEYS.length ? [] : ALL_PAGE_KEYS;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && currentRow) {
        await updateMutation.mutateAsync({
          id: currentRow.id,
          data: {
            name: values.name,
            description: values.description || undefined,
            pageKeys: values.pageKeys,
          },
        });
        toast.success(t('form.updateSuccess'));
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          pageKeys: values.pageKeys,
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
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.descriptionLabel')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('form.descriptionPlaceholder')}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pageKeys"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t('form.permissions')}</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(toggleAll(field.value))}
                    >
                      {field.value.length === ALL_PAGE_KEYS.length
                        ? t('form.deselectAll')
                        : t('form.selectAll')}
                    </Button>
                  </div>

                  <div className="space-y-4 rounded-md border p-4">
                    {ADMIN_PAGE_GROUPS.map((group) => (
                      <div key={group.group}>
                        <div className="text-sm font-semibold text-muted-foreground mb-2">
                          {group.group}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {group.pages.map((page) => {
                            const checked = field.value.includes(page.key);
                            return (
                              <label
                                key={page.key}
                                className="flex items-center gap-2 cursor-pointer text-sm"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() =>
                                    field.onChange(togglePage(page.key, field.value))
                                  }
                                />
                                {page.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
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
