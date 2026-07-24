'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ArrowRight, Check, Loader2, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
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

import { useProduct } from '../../context/products-provider';
import { useCreateProduct } from '../../usecases/use-create-product';
import { useListCategories } from '../../usecases/use-list-categories';
import { useUpdateProduct } from '../../usecases/use-update-product';
import { ProductImagesManager } from './product-images-manager';
import { ProductAttributesManager } from './product-attributes-manager';

const SIZE_UNITS = ['cl', 'ml', 'L', 'g', 'kg', 'cm', 'm', 'pcs'] as const;

const formSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().optional().or(z.literal('')),
  price: z.number().min(1),
  preparationTime: z.number().int().min(0),
  sizeValue: z.number().min(0).optional().nullable(),
  sizeUnit: z.string().optional().or(z.literal('')),
  isAvailable: z.boolean(),
  categoryIds: z.array(z.string().uuid()).min(1, { message: 'Au moins une catégorie' }),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductFormDialog() {
  const t = useTranslations('admin.products');
  const { open, setOpen, currentRow, setCurrentRow } = useProduct();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categories = [] } = useListCategories();

  const isEditing = open === 'edit' && !!currentRow;
  const isOpen = open === 'create' || open === 'edit';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 1,
      preparationTime: 0,
      sizeValue: null,
      sizeUnit: '',
      isAvailable: true,
      categoryIds: [],
    },
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        name: currentRow.name ?? '',
        description: currentRow.description ?? '',
        price: Number(currentRow.price) || 1,
        preparationTime: Number(currentRow.preparationTime) || 0,
        sizeValue: currentRow.sizeValue != null ? Number(currentRow.sizeValue) : null,
        sizeUnit: currentRow.sizeUnit ?? '',
        isAvailable: currentRow.isAvailable ?? true,
        categoryIds: currentRow.categoryIds?.length
          ? currentRow.categoryIds
          : currentRow.categoryId
            ? [currentRow.categoryId]
            : [],
      });
    } else if (open === 'create') {
      form.reset({
        name: '',
        description: '',
        price: 1,
        preparationTime: 0,
        sizeValue: null,
        sizeUnit: '',
        isAvailable: true,
        categoryIds: [],
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
        price: values.price,
        preparationTime: values.preparationTime || undefined,
        sizeValue: values.sizeValue ?? undefined,
        sizeUnit: values.sizeUnit || undefined,
        isAvailable: values.isAvailable,
        categoryIds: values.categoryIds,
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

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Package className="h-5 w-5" strokeWidth={1.75} />
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
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={({ field }) => {
                    const selected = field.value ?? [];
                    const toggle = (id: string) =>
                      field.onChange(
                        selected.includes(id)
                          ? selected.filter((v) => v !== id)
                          : [...selected, id],
                      );
                    return (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          {t('form.category')} <span className="text-muted-foreground">(plusieurs possibles)</span>
                        </FormLabel>
                        {categories.length === 0 ? (
                          <p className="text-xs text-muted-foreground">{t('form.noCategories')}</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {categories.map((c: any) => {
                              const active = selected.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => toggle(c.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                    active
                                      ? 'border-primary bg-primary text-primary-foreground'
                                      : 'border-border bg-background hover:bg-accent'
                                  }`}
                                >
                                  {active && <Check className="h-3 w-3" />}
                                  {c.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.pricing')}
                </h3>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.price')}</FormLabel>
                      <FormControl>
                        <div className="relative max-w-[240px]">
                          <Input
                            type="number"
                            min={1}
                            step="0.01"
                            className="h-10 pr-8"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            €
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.logistics')}
                </h3>
                <FormField
                  control={form.control}
                  name="preparationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">
                        {t('form.preparationTime')}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            className="h-10 pr-14"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {t('form.minutes')}
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t('form.preparationHint')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="sizeValue"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="text-xs font-medium">{t('form.sizeValue')}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="h-10"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === '' ? null : Number(v));
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sizeUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t('form.sizeUnit')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SIZE_UNITS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.visibility')}
                </h3>
                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">
                          {t('form.isAvailable')}
                        </FormLabel>
                        <FormDescription className="text-[11px]">
                          {t('form.isAvailableHint')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Images
                </h3>
                {isEditing && currentRow ? (
                  <ProductImagesManager productId={currentRow.id} />
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-xs text-muted-foreground">
                    Enregistrez d&apos;abord le produit, puis rouvrez-le en édition pour ajouter des
                    images.
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Caractéristiques
                </h3>
                {isEditing && currentRow ? (
                  <ProductAttributesManager productId={currentRow.id} />
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-xs text-muted-foreground">
                    Enregistrez d&apos;abord le produit, puis rouvrez-le en édition pour ajouter des
                    caractéristiques.
                  </p>
                )}
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
