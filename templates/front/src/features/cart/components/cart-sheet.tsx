'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCartContext } from '../context/cart-provider';

function formatPrice(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

export function CartSheet() {
  const locale = useLocale();
  const cart = useCartContext();
  if (!cart) return null;

  const { open, setOpen, items, totalCents, updateItem, removeItem, isMutating } = cart;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Mon panier
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShoppingCart className="h-10 w-10 opacity-30" />
            <p>Votre panier est vide.</p>
          </div>
        ) : (
          <>
            <ScrollArea className="-mx-6 flex-1 px-6">
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3 py-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{item.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(item.unitPriceCents, locale)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={isMutating}
                            onClick={() => updateItem(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            disabled={isMutating}
                            onClick={() => updateItem(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={isMutating}
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatPrice(item.unitPriceCents * item.quantity, locale)}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <Separator />

            <SheetFooter className="flex-col gap-3 sm:flex-col">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalCents, locale)}</span>
              </div>
              <Button asChild className="w-full gap-2" disabled={isMutating}>
                <Link href={`/${locale}/checkout`} onClick={() => setOpen(false)}>
                  {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Passer commande
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
