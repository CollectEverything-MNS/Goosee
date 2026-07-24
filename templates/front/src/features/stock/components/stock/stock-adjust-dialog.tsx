'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Loader2, PackagePlus } from 'lucide-react';
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

import { useStock } from '../../context/stock-provider';
import { useAdjustStock } from '../../usecases/use-adjust-stock';

const formSchema = z.object({
  quantity: z.number().int().refine((v) => v !== 0, { message: 'Requis' }),
});

type FormValues = z.infer<typeof formSchema>;

export function StockAdjustDialog() {
  const t = useTranslations('admin.stock.adjust');
  const { open, setOpen, currentRow, setCurrentRow } = useStock();
  const adjustMutation = useAdjustStock();

  const isOpen = open === 'adjust' && !!currentRow;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 0 },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ quantity: 0 });
    }
  }, [isOpen, form]);

  const handleClose = () => {
    setCurrentRow(null);
    setOpen(null);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await adjustMutation.mutateAsync({
        productId: currentRow.productId,
        data: { quantity: values.quantity },
      });
      toast.success(t('success'));
      handleClose();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        toast.error(t('error'));
      }
    }
  };

  const productName = currentRow?.product?.name ?? currentRow?.productId ?? '';

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[420px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <PackagePlus className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">{t('title')}</DialogTitle>
              <DialogDescription className="text-xs">
                {t('subtitle', { name: productName })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-6 py-6">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium">{t('deltaLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step={1}
                        className="h-10"
                        value={field.value ?? 0}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">{t('deltaHint')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-6 py-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={adjustMutation.isPending}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={adjustMutation.isPending} className="gap-2">
                {adjustMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('confirm')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
