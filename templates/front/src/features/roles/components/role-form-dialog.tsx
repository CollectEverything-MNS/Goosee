'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

import { useRoles } from '../context/roles-provider';
import { ADMIN_PAGE_GROUPS, ALL_PAGE_KEYS } from '../data/admin-pages';
import { useCreateRole } from '../usecases/use-create-role';
import { useUpdateRole } from '../usecases/use-update-role';

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
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">
                {isEditing ? t('form.editTitle') : t('form.createTitle')}
              </DialogTitle>
              <DialogDescription className="text-xs">{t('form.description')}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.identity')}
                </h3>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.namePlaceholder')}
                          className="h-10"
                          {...field}
                        />
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
                      <FormLabel className="text-xs font-medium">
                        {t('form.descriptionLabel')}
                      </FormLabel>
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
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('form.sections.permissions')}
                  </h3>
                  <FormField
                    control={form.control}
                    name="pageKeys"
                    render={({ field }) => (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => field.onChange(toggleAll(field.value))}
                      >
                        {field.value.length === ALL_PAGE_KEYS.length
                          ? t('form.deselectAll')
                          : t('form.selectAll')}
                      </Button>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="pageKeys"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4 rounded-lg border border-border bg-background p-4">
                        {ADMIN_PAGE_GROUPS.map((group) => (
                          <div key={group.group}>
                            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {group.group}
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {group.pages.map((page) => {
                                const checked = field.value.includes(page.key);
                                return (
                                  <label
                                    key={page.key}
                                    className="flex cursor-pointer items-center gap-2 text-sm"
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
              </section>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
                {t('form.cancel')}
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? t('form.update') : t('form.create')}
                {!isPending && !isEditing && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
