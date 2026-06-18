'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, Mail, MapPin, Phone } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useSiteTemplate } from '@/hooks/use-site-template';

import { BlockPropsWithContext, ContactBlockProps } from './types';

/* ------------------------------------------------------------------ */
/* Logique de formulaire partagée                                     */
/* ------------------------------------------------------------------ */

function useContactState(isPreview: boolean) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPreview) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return { loading, sent, setSent, handleSubmit };
}

function buildInfos(email?: string, phone?: string, address?: string) {
  return [
    { icon: Mail, label: 'Email', value: email },
    { icon: Phone, label: 'Téléphone', value: phone },
    { icon: MapPin, label: 'Adresse', value: address },
  ].filter((i) => i.value);
}

interface FormTheme {
  label: string;
  input: string;
  button: string;
}

function FormField({
  id,
  label,
  theme,
  isPreview,
  type = 'text',
  placeholder,
  textarea = false,
}: {
  id: string;
  label: string;
  theme: FormTheme;
  isPreview: boolean;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className={theme.label}>
        {label}
      </Label>
      {textarea ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          rows={5}
          required
          disabled={isPreview}
          className={theme.input}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          required
          disabled={isPreview}
          className={theme.input}
        />
      )}
    </div>
  );
}

function ContactForm({ isPreview, theme }: { isPreview: boolean; theme: FormTheme }) {
  const { loading, sent, setSent, handleSubmit } = useContactState(isPreview);

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold">Message envoyé !</h3>
        <p className="opacity-70">
          Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-sm underline underline-offset-4 opacity-80 transition hover:opacity-100"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="cb-firstName" label="Prénom" placeholder="Jean" theme={theme} isPreview={isPreview} />
        <FormField id="cb-lastName" label="Nom" placeholder="Dupont" theme={theme} isPreview={isPreview} />
      </div>
      <FormField id="cb-email" label="Email" type="email" placeholder="jean@example.com" theme={theme} isPreview={isPreview} />
      <FormField id="cb-subject" label="Sujet" placeholder="Votre sujet" theme={theme} isPreview={isPreview} />
      <FormField id="cb-message" label="Message" placeholder="Votre message..." textarea theme={theme} isPreview={isPreview} />
      <button type="submit" disabled={loading || isPreview} className={theme.button}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Envoyer
      </button>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Dispatch par template                                              */
/* ------------------------------------------------------------------ */

export function ContactBlock(props: BlockPropsWithContext<ContactBlockProps>) {
  const template = useSiteTemplate();

  if (template === 'restaurant') return <RestaurantContact {...props} />;
  if (template === 'bakery') return <BakeryContact {...props} />;
  if (template === 'beauty') return <BeautyContact {...props} />;
  if (template === 'drive') return <DriveContact {...props} />;
  return <DefaultContact {...props} />;
}

/* ----- DEFAULT — bandeau coloré + cartes ----- */
function DefaultContact({
  title = 'Contactez-nous',
  subtitle = 'Une question, une suggestion ? Notre équipe vous répond sous 24h.',
  email = 'contact@votresite.com',
  phone = '01 23 45 67 89',
  address = '123 Rue du Commerce, 57000 Metz',
  backgroundColor,
  textColor,
  context,
}: BlockPropsWithContext<ContactBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const infos = buildInfos(email, phone, address);
  const theme: FormTheme = {
    label: 'text-sm font-medium',
    input: 'h-11',
    button:
      'mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50',
  };

  return (
    <section
      className={cn('w-full', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      {(title || subtitle) && (
        <div className="bg-primary px-4 py-16 text-center text-white">
          <div className="mx-auto max-w-3xl">
            {title && (
              <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-3 text-lg opacity-90">{subtitle}</p>}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-6">
            {infos.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 rounded-lg border bg-card p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border bg-card p-6 md:col-span-2">
            <h3 className="mb-4 text-lg font-semibold">Envoyez-nous un message</h3>
            <ContactForm isPreview={isPreview} theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----- DRIVE — SaaS clair, cartes blanches arrondies + ombre ----- */
function DriveContact({
  title = 'Contactez-nous',
  subtitle = 'Une question sur votre commande ? On vous répond vite.',
  email = 'contact@votresite.com',
  phone = '01 23 45 67 89',
  address = '123 Rue du Commerce, 57000 Metz',
  backgroundColor = '#f8fafc',
  textColor,
  context,
}: BlockPropsWithContext<ContactBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const infos = buildInfos(email, phone, address);
  const theme: FormTheme = {
    label: 'text-sm font-medium text-foreground',
    input: 'h-11 rounded-xl',
    button:
      'mt-2 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50',
  };

  return (
    <section
      className={cn('w-full px-6 py-14 md:px-12 md:py-20 lg:px-20', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-6xl">
        {(title || subtitle) && (
          <div className="mb-10">
            {title && (
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {infos.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="truncate font-semibold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:p-8 lg:col-span-3">
            <ContactForm isPreview={isPreview} theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----- BAKERY — ambré chaleureux, formes arrondies ----- */
function BakeryContact({
  title = 'Écrivez-nous',
  subtitle = 'Une commande spéciale, une question gourmande ? On adore ça.',
  email = 'contact@votresite.com',
  phone = '01 23 45 67 89',
  address = '123 Rue du Commerce, 57000 Metz',
  backgroundColor = '#fffbeb',
  textColor = '#78350f',
  context,
}: BlockPropsWithContext<ContactBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const infos = buildInfos(email, phone, address);
  const theme: FormTheme = {
    label: 'text-sm font-medium text-[#78350f]',
    input: 'h-11 rounded-xl border-amber-200 bg-white/70 focus-visible:ring-amber-300',
    button:
      'mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#78350f] px-4 py-3 text-sm font-semibold text-amber-50 transition hover:bg-[#5c2a0c] disabled:opacity-50',
  };

  return (
    <section
      className={cn('w-full px-6 py-16 md:px-12 md:py-20 lg:px-20', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-5xl">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            {title && (
              <h2 className="text-2xl font-semibold italic sm:text-3xl md:text-4xl" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-base opacity-80" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            {infos.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-white/70 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Icon className="h-5 w-5 text-[#78350f]" />
                </div>
                <div>
                  <h3 className="font-semibold italic text-[#78350f]">{label}</h3>
                  <p className="text-sm text-[#78350f]/70">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-amber-200 bg-white/70 p-6 md:col-span-3 md:p-8">
            <ContactForm isPreview={isPreview} theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----- RESTAURANT — épuré éditorial, inputs filaires, accent cuivre ----- */
function RestaurantContact({
  title,
  subtitle = 'Une table, une question, un événement privé ? Écrivez-nous.',
  email = 'contact@votresite.com',
  phone = '01 23 45 67 89',
  address = '123 Rue du Commerce, 57000 Metz',
  backgroundColor = '#ffffff',
  textColor = '#0a0a0a',
  context,
}: BlockPropsWithContext<ContactBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const infos = buildInfos(email, phone, address);
  const theme: FormTheme = {
    label: 'text-[11px] font-medium uppercase tracking-[0.25em] text-neutral-500',
    input:
      'h-11 rounded-none border-0 border-b border-neutral-300 bg-transparent px-0 shadow-none focus-visible:border-[#c2410c] focus-visible:ring-0',
    button:
      'mt-4 inline-flex w-full items-center justify-center rounded-none bg-[#1c1917] px-4 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#c2410c] disabled:opacity-50',
  };

  return (
    <section
      className={cn('w-full px-6 py-20 md:px-12 lg:px-20', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={{ backgroundColor }}
      onClick={context?.onSelect}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <div className="text-xs uppercase tracking-[0.4em] text-[#c2410c]">Nous écrire</div>
          {title && (
            <h2 className="mt-3 text-3xl font-medium italic md:text-4xl" style={{ color: textColor }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed opacity-60" style={{ color: textColor }}>
              {subtitle}
            </p>
          )}
          <div className="mx-auto mt-6 h-px w-10 bg-[#c2410c]" />
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-6" style={{ color: textColor }}>
            {infos.map(({ icon: Icon, label, value }, i) => (
              <div key={label} className={cn('flex items-start gap-4 pb-6', i < infos.length - 1 && 'border-b border-neutral-200')}>
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#c2410c]" strokeWidth={1.5} />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">{label}</div>
                  <div className="mt-1 text-base">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <ContactForm isPreview={isPreview} theme={theme} />
        </div>
      </div>
    </section>
  );
}

/* ----- BEAUTY — rose poudré, dégradé, formes douces ----- */
function BeautyContact({
  title = 'Prenons contact',
  subtitle = 'Un soin, un conseil, un rendez-vous ? Nous sommes à votre écoute.',
  email = 'contact@votresite.com',
  phone = '01 23 45 67 89',
  address = '123 Rue du Commerce, 57000 Metz',
  backgroundColor,
  textColor = '#831843',
  context,
}: BlockPropsWithContext<ContactBlockProps>) {
  const isPreview = context?.mode === 'preview';
  const infos = buildInfos(email, phone, address);
  const theme: FormTheme = {
    label: 'text-xs font-medium uppercase tracking-[0.15em] text-[#831843]/70',
    input: 'h-11 rounded-full border-pink-200 bg-white/70 px-4 focus-visible:ring-pink-300',
    button:
      'mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#831843] px-4 py-3 text-sm font-medium text-pink-50 transition hover:bg-[#6d1238] disabled:opacity-50',
  };

  return (
    <section
      className={cn('relative w-full overflow-hidden px-6 py-16 md:px-12 md:py-20 lg:px-20', context?.isSelected && 'ring-2 ring-primary ring-offset-2')}
      style={backgroundColor ? { backgroundColor } : { background: 'linear-gradient(180deg, #fdf2f8 0%, #fff 100%)' }}
      onClick={context?.onSelect}
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        {(title || subtitle) && (
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.35em] opacity-70" style={{ color: textColor }}>
              <span>✦</span>
              <span>Contact</span>
              <span>✦</span>
            </div>
            {title && (
              <h2 className="mt-3 text-3xl font-light italic md:text-4xl" style={{ color: textColor }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed opacity-70" style={{ color: textColor }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div className="space-y-4 md:col-span-2">
            {infos.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 rounded-3xl border border-pink-100 bg-white/70 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pink-100">
                  <Icon className="h-5 w-5 text-[#831843]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.15em] text-[#831843]/60">{label}</div>
                  <div className="truncate text-[#831843]">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-pink-100 bg-white/80 p-6 md:col-span-3 md:p-8">
            <ContactForm isPreview={isPreview} theme={theme} />
          </div>
        </div>
      </div>
    </section>
  );
}
