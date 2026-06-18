'use client';

import { useLocale } from 'next-intl';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';
import { routes } from '@/config/routes.config';
import { useGetOrder } from '../usecases/use-get-order';

function formatPrice(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

function formatDate(value: string, locale: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function Invoice({ id }: { id: string }) {
  const locale = useLocale();
  const { data: order, isLoading, isError } = useGetOrder(id);
  const { data: settings } = useSettings();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold">Facture introuvable</h1>
        <p className="text-muted-foreground">Cette commande n&apos;existe pas ou n&apos;est plus accessible.</p>
        <Button asChild variant="outline">
          <Link href={`${routes.public.account.getHref(locale)}?tab=orders`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mes commandes
          </Link>
        </Button>
      </div>
    );
  }

  const shopName = settings?.title || 'Boutique';
  const company = settings?.metadata?.company;
  const customerName = order.billingAddress?.fullName || order.customerEmail.split('@')[0];

  return (
    <div className="min-h-screen overflow-x-auto bg-muted/40 py-8 print:bg-white print:py-0">
      {/* Règle d'impression : page A4 avec marges, fond blanc. */}
      <style>{`@media print { @page { size: A4; margin: 14mm; } html, body { background:#fff; } }`}</style>

      {/* Barre d'actions — masquée à l'impression */}
      <div className="mx-auto mb-6 flex w-[210mm] max-w-full items-center justify-between px-4 print:hidden">
        <Button asChild variant="ghost">
          <Link href={`${routes.public.account.getHref(locale)}?tab=orders`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Mes commandes
          </Link>
        </Button>
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimer / Enregistrer en PDF
        </Button>
      </div>

      {/* Feuille A4 */}
      <div className="mx-auto flex min-h-[297mm] w-[210mm] max-w-full flex-col bg-white p-[18mm] text-[13px] leading-relaxed text-foreground shadow-sm print:min-h-0 print:w-auto print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b pb-6">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logoUrl} alt={shopName} className="h-14 w-14 object-contain" />
            ) : null}
            <div>
              <p className="text-lg font-bold">{shopName}</p>
              {settings?.description ? (
                <p className="max-w-xs text-xs text-muted-foreground">{settings.description}</p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight">FACTURE</p>
            <p className="text-sm text-muted-foreground">{order.reference}</p>
            <p className="text-sm text-muted-foreground">{formatDate(order.createdAt, locale)}</p>
          </div>
        </div>

        <div className="grid gap-8 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Vendeur
            </p>
            <p className="mt-1 font-medium">{shopName}</p>
            {company?.address ? <p className="text-muted-foreground">{company.address}</p> : null}
            {company?.postalCode || company?.city ? (
              <p className="text-muted-foreground">
                {company?.postalCode} {company?.city}
              </p>
            ) : null}
            {company?.country ? <p className="text-muted-foreground">{company.country}</p> : null}
            {company?.email ? <p className="text-muted-foreground">{company.email}</p> : null}
            {company?.phone ? <p className="text-muted-foreground">{company.phone}</p> : null}
            {company?.siret ? (
              <p className="mt-1 text-xs text-muted-foreground">SIRET : {company.siret}</p>
            ) : null}
            {company?.vatNumber ? (
              <p className="text-xs text-muted-foreground">N° TVA : {company.vatNumber}</p>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Facturé à
            </p>
            <p className="mt-1 font-medium capitalize">{customerName}</p>
            <p className="text-muted-foreground">{order.customerEmail}</p>
            {order.billingAddress ? (
              <p className="text-muted-foreground">
                {order.billingAddress.line1}
                <br />
                {order.billingAddress.postalCode} {order.billingAddress.city}
                <br />
                {order.billingAddress.country}
              </p>
            ) : null}
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y bg-muted/40 print:bg-transparent">
              <th className="px-3 py-2 text-left font-semibold">Désignation</th>
              <th className="px-3 py-2 text-right font-semibold">Qté</th>
              <th className="px-3 py-2 text-right font-semibold">Prix unitaire</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b">
                <td className="px-3 py-2.5">{item.name}</td>
                <td className="px-3 py-2.5 text-right">{item.quantity}</td>
                <td className="px-3 py-2.5 text-right">{formatPrice(item.unitPriceCents, locale)}</td>
                <td className="px-3 py-2.5 text-right font-medium">
                  {formatPrice(item.unitPriceCents * item.quantity, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
              <span>Total TTC</span>
              <span>{formatPrice(order.totalCents, locale)}</span>
            </div>
          </div>
        </div>

        <p className="mt-auto border-t pt-4 text-center text-xs text-muted-foreground">
          Document généré automatiquement par {shopName} — merci de votre confiance.
        </p>
      </div>
    </div>
  );
}
