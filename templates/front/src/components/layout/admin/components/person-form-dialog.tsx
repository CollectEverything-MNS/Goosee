'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { ArrowRight, Loader2, LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { AdminAvatar } from '@/components/layout/admin/components/admin-avatar';
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
import { useCreateUser } from '@/features/users/usecases/use-create-user';
import { useUpdateUser } from '@/features/users/usecases/use-update-user';

export const personFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  phone: z.string().min(6).max(20).optional().or(z.literal('')),
  address: z.string().min(2).max(120).optional().or(z.literal('')),
  postaleCode: z.string().min(2).max(12).optional().or(z.literal('')),
  city: z.string().min(2).max(60).optional().or(z.literal('')),
  country: z.string().min(2).max(60).optional().or(z.literal('')),
  role: z.string().min(1),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

function formatDateTime(value: string | Date | undefined, locale: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export interface PersonFormDialogProps {
  isOpen: boolean;
  isEditing: boolean;
  currentRow: any | null;
  onClose: () => void;
  translationsNamespace: string;
  headerIcon: LucideIcon;
  iconTone?: 'admin' | 'client';
  rolesOptions: { value: string; label: string }[];
  defaultRole?: string;
  showRoleSelect?: boolean;
  emailPlaceholder?: string;
}

const TONE_BG: Record<NonNullable<PersonFormDialogProps['iconTone']>, string> = {
  admin: 'bg-violet-50 text-violet-700',
  client: 'bg-sky-50 text-sky-700',
};

export function PersonFormDialog({
  isOpen,
  isEditing,
  currentRow,
  onClose,
  translationsNamespace,
  headerIcon: HeaderIcon,
  iconTone = 'admin',
  rolesOptions,
  defaultRole = '',
  showRoleSelect = true,
  emailPlaceholder = 'user@mail.com',
}: PersonFormDialogProps) {
  const t = useTranslations(translationsNamespace);
  const locale = useLocale();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const emptyValues: PersonFormValues = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    postaleCode: '',
    city: '',
    country: '',
    role: defaultRole,
  };

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        email: currentRow.email ?? '',
        firstName: currentRow.firstName ?? '',
        lastName: currentRow.lastName ?? '',
        phone: currentRow.phone ?? '',
        address: currentRow.address ?? '',
        postaleCode: currentRow.postaleCode ?? '',
        city: currentRow.city ?? '',
        country: currentRow.country ?? '',
        role: currentRow.role?.[0] ?? defaultRole,
      });
    } else if (isOpen && !isEditing) {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentRow, isEditing, defaultRole, form]);

  const onSubmit = async (values: PersonFormValues) => {
    try {
      const payload = {
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        address: values.address || undefined,
        postaleCode: values.postaleCode || undefined,
        city: values.city || undefined,
        country: values.country || undefined,
        role: [values.role],
      };
      if (isEditing) {
        await updateMutation.mutateAsync({ id: currentRow.id, data: payload });
        toast.success(t('form.updateSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('form.createSuccess'));
      }
      onClose();
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
  const watchedFirst = form.watch('firstName');
  const watchedLast = form.watch('lastName');
  const watchedEmail = form.watch('email');

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <AdminAvatar
                firstName={watchedFirst}
                lastName={watchedLast}
                email={watchedEmail}
                size="lg"
              />
            ) : (
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${TONE_BG[iconTone]}`}
              >
                <HeaderIcon className="h-5 w-5" strokeWidth={1.75} />
              </div>
            )}
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
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          {t('form.firstName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('form.firstNamePlaceholder')}
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          {t('form.lastName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t('form.lastNamePlaceholder')}
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.contact')}
                </h3>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={emailPlaceholder}
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.phone')}</FormLabel>
                      <FormControl>
                        <Input placeholder="+33 6 12 34 56 78" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('form.sections.address')}
                </h3>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.address')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('form.addressPlaceholder')}
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="postaleCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          {t('form.postaleCode')}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="57000" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-xs font-medium">{t('form.city')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Metz" className="h-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium">{t('form.country')}</FormLabel>
                      <FormControl>
                        <Input placeholder="France" className="h-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              {isEditing && currentRow && (
                <section className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('form.sections.meta')}
                  </h3>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-border bg-muted/20 p-4">
                    <div className="space-y-0.5">
                      <dt className="text-[11px] text-muted-foreground">{t('form.meta.createdAt')}</dt>
                      <dd className="text-sm font-medium">{formatDateTime(currentRow.createdAt, locale)}</dd>
                    </div>
                    <div className="space-y-0.5">
                      <dt className="text-[11px] text-muted-foreground">{t('form.meta.updatedAt')}</dt>
                      <dd className="text-sm font-medium">{formatDateTime(currentRow.updatedAt, locale)}</dd>
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <dt className="text-[11px] text-muted-foreground">{t('form.meta.id')}</dt>
                      <dd className="font-mono text-xs text-foreground/80">{currentRow.id ?? '—'}</dd>
                    </div>
                  </dl>
                </section>
              )}

              {showRoleSelect && (
                <section className="space-y-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('form.sections.permissions')}
                  </h3>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">{t('form.role')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('form.rolePlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rolesOptions.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
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
