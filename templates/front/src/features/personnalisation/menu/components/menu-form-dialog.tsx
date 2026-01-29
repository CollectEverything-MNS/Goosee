'use client';

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
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useMenu } from '../context/menu-provider';
import { useCreateMenu } from '../usecases/use-create-menu';
import { useUpdateMenu } from '../usecases/use-update-menu';
import { useMenus } from '../usecases/use-list-menus';
import { usePages } from '@/features/personnalisation/pages/usecases/list-pages/use-list-pages';
import { Menu } from '../types/menu.types';

const formSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  linkType: z.enum(['page', 'external']),
  pageId: z.string().optional(),
  externalUrl: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean(),
  openInNewTab: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function MenuFormDialog() {
  const t = useTranslations('admin.menu');
  const { open, setOpen, currentRow } = useMenu();
  const createMutation = useCreateMenu();
  const updateMutation = useUpdateMenu();
  const { data: menus = [] } = useMenus();
  const { data: pages = [] } = usePages();

  const isEditing = open === 'edit' && currentRow;
  const isOpen = open === 'create' || open === 'edit';

  // Flatten menus for parent selection (exclude current menu and its children)
  const flattenMenus = (items: Menu[], exclude?: string): Menu[] => {
    return items.reduce<Menu[]>((acc, item) => {
      if (item.id !== exclude) {
        acc.push(item);
        if (item.children) {
          acc.push(...flattenMenus(item.children, exclude));
        }
      }
      return acc;
    }, []);
  };

  const availableParents = flattenMenus(menus, currentRow?.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
      linkType: 'page',
      pageId: 'none',
      externalUrl: '',
      parentId: 'none',
      isActive: true,
      openInNewTab: false,
    },
  });

  useEffect(() => {
    if (isEditing && currentRow) {
      form.reset({
        label: currentRow.label,
        linkType: currentRow.externalUrl ? 'external' : 'page',
        pageId: currentRow.pageId || 'none',
        externalUrl: currentRow.externalUrl || '',
        parentId: currentRow.parentId || 'none',
        isActive: currentRow.isActive,
        openInNewTab: currentRow.openInNewTab,
      });
    } else if (open === 'create') {
      form.reset({
        label: '',
        linkType: 'page',
        pageId: 'none',
        externalUrl: '',
        parentId: 'none',
        isActive: true,
        openInNewTab: false,
      });
    }
  }, [isEditing, currentRow, open, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const data = {
        label: values.label,
        pageId: values.linkType === 'page' && values.pageId !== 'none' ? values.pageId : undefined,
        externalUrl: values.linkType === 'external' ? values.externalUrl || undefined : undefined,
        parentId: values.parentId !== 'none' ? values.parentId : undefined,
        isActive: values.isActive,
        openInNewTab: values.openInNewTab,
      };

      if (isEditing && currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.id, data });
        toast.success(t('actions.updateSuccess'));
      } else {
        await createMutation.mutateAsync(data);
        toast.success(t('actions.createSuccess'));
      }
      setOpen(null);
    } catch {
      toast.error(isEditing ? t('actions.updateError') : t('actions.createError'));
    }
  };

  const linkType = form.watch('linkType');

  return (
    <Dialog open={isOpen} onOpenChange={() => setOpen(null)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('dialog.editTitle') : t('dialog.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('form.labelPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.linkType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.selectLinkType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="page">{t('form.linkTypePage')}</SelectItem>
                      <SelectItem value="external">{t('form.linkTypeExternal')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {linkType === 'page' && (
              <FormField
                control={form.control}
                name="pageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.page')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectPage')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t('form.selectPage')}</SelectItem>
                        {pages.map((page) => (
                          <SelectItem key={page.id} value={page.id}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {linkType === 'external' && (
              <FormField
                control={form.control}
                name="externalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('form.externalUrl')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('form.parent')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.noParent')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('form.noParent')}</SelectItem>
                      {availableParents.map((menu) => (
                        <SelectItem key={menu.id} value={menu.id}>
                          {menu.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">{t('form.isActive')}</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openInNewTab"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">{t('form.openInNewTab')}</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(null)}>
                {t('form.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? t('form.update') : t('form.create')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
