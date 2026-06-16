'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ArrowRight, Loader2, Tags } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { useCategory } from '../../context/categories-provider';
import { useCreateCategory } from '../../usecases/use-create-category';
import { useListCategories } from '../../usecases/use-list-categories';
import { useUpdateCategory } from '../../usecases/use-update-category';

const NO_PARENT = '__none__';

const formSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  parentId: z.string().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function CategoryFormDialog() {
  const t = useTranslations('admin.categories');
  const { open, setOpen, currentRow, setCurrentRow } = useCategory();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const { data: categories = [] } = useListCategories();

  const isEditing = open === 'edit' && !!currentRow;
  const isOpen = open === 'create' || open === 'edit';

  const parentOptions = useMemo(
    () => categories.filter((c: any) => c.id !== currentRow?.id),
    [categories, currentRow?.id]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      parentId: NO_PARENT,
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        name: currentRow.name ?? '',
        description: currentRow.description ?? '',
        imageUrl: currentRow.imageUrl ?? '',
        parentId: currentRow.parentId ?? NO_PARENT,
        order: currentRow.order ?? 0,
        isActive: currentRow.isActive ?? true,
      });
    } else if (open === 'create') {
      form.reset({
        name: '',
        description: '',
        imageUrl: '',
        parentId: NO_PARENT,
        order: 0,
        isActive: true,
      });
    }
  }, [open, currentRow, isEditing, form]);

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || undefined,
        imageUrl: values.imageUrl || undefined,
        parentId: values.parentId === NO_PARENT ? undefined : values.parentId || undefined,
        order: values.order,
        isActive: values.isActive,
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: currentRow.id, data: payload });
        toast.success(t('form.updateSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
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
  const watchedImage = form.watch('imageUrl');
  const watchedName = form.watch('name');

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-emerald-50 text-emerald-700">
              {watchedImage ? (
                <img src={watchedImage} alt={watchedName} className="h-full w-full object-cover" />
              ) : (
                <Tags className="h-5 w-5" strokeWidth={1.75} />
              )}
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">
                {isEditing ? t('form.editTitle') : t('form.createTitle')}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing ? t('form.editSubtitle') : t('form.createSubtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6 px-6 py-6">
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
                      <FormLabel className="text-xs font-medium">{t('form.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('form.descriptionPlaceholder')}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.visual')}
                </h3>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.imageUrl')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t('form.imageUrlHint')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.organization')}
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t('form.parent')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || NO_PARENT}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('form.parentPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_PARENT}>{t('form.noParent')}</SelectItem>
                            {parentOptions.map((c: any) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t('form.order')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="h-10"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">{t('form.isActive')}</FormLabel>
                        <FormDescription className="text-[11px]">
                          {t('form.isActiveHint')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
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
