'use client';

import { Coffee, Flower2, ShoppingCart, UtensilsCrossed } from 'lucide-react';

import type { TemplateCategory } from '../data';

interface Props {
  category: TemplateCategory;
  accent: string;
  name: string;
}

export function TemplatePreviewArt({ category, accent, name }: Props) {
  switch (category) {
    case 'drive':
      return <DrivePreview accent={accent} name={name} />;
    case 'bakery':
      return <BakeryPreview accent={accent} name={name} />;
    case 'restaurant':
      return <RestaurantPreview accent={accent} name={name} />;
    case 'beauty':
      return <BeautyPreview accent={accent} name={name} />;
  }
}

/* ----- DRIVE : grille produits, fond clair, vibe efficace ----- */
function DrivePreview({ accent, name }: { accent: string; name: string }) {
  return (
    <div className="relative h-full w-full bg-slate-50">
      <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5 shadow-sm sm:px-3 sm:py-2">
        <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
          <ShoppingCart className="h-2.5 w-2.5 shrink-0 text-slate-700 sm:h-3 sm:w-3" />
          <span className="truncate text-[9px] font-semibold text-slate-700 sm:text-[10px]">
            {name}
          </span>
        </div>
        <span
          className="shrink-0 rounded px-1 py-0.5 text-[7px] font-bold uppercase tracking-wider sm:px-1.5 sm:text-[8px]"
          style={{ backgroundColor: accent, color: '#0a0a0a' }}
        >
          −20%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1.5 sm:gap-1.5 sm:p-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded bg-white"
            style={{ aspectRatio: '1 / 1' }}
          >
            <div
              className="h-2/3 w-full"
              style={{
                background: `linear-gradient(135deg, ${accent}33 0%, ${accent}11 100%)`,
              }}
            />
            <div className="space-y-0.5 px-1 pt-0.5">
              <div className="h-0.5 w-3/4 rounded-sm bg-slate-300 sm:h-1" />
              <div className="h-0.5 w-1/2 rounded-sm sm:h-1" style={{ backgroundColor: accent }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----- BAKERY : fond crème, papier kraft, typo serif, vibe artisan ----- */
function BakeryPreview({ accent, name }: { accent: string; name: string }) {
  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-3"
      style={{
        background:
          'radial-gradient(circle at 30% 20%, #fef3c7 0%, #fde68a 35%, #fbbf24 100%)',
      }}
    >
      <div
        className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full sm:left-3 sm:top-3 sm:h-7 sm:w-7"
        style={{ backgroundColor: '#fff', color: accent }}
      >
        <Coffee className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={1.5} />
      </div>
      <div
        className="absolute right-2 top-2 hidden text-[8px] font-bold uppercase tracking-[0.2em] sm:right-3 sm:top-3 sm:block"
        style={{ color: accent }}
      >
        depuis 1932
      </div>

      <div className="w-full space-y-1 px-2 text-center">
        <div
          className="truncate font-serif text-sm italic sm:text-base"
          style={{ color: accent }}
          title={name}
        >
          {name}
        </div>
        <div className="mx-auto h-px w-8 sm:w-12" style={{ backgroundColor: accent }} />
        <div className="text-[8px] uppercase tracking-[0.25em] text-amber-900/70 sm:text-[9px]">
          fait maison
        </div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex flex-wrap items-center justify-center gap-1 px-2 sm:gap-1.5 sm:px-3">
        {['Pain', 'Viennoiserie', 'Gâteau'].map((label) => (
          <span
            key={label}
            className="rounded-full bg-white/80 px-1.5 py-0.5 text-[7px] font-medium text-amber-900 sm:px-2 sm:text-[8px]"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----- RESTAURANT : sombre élégant, menu manuscrit, bistronomie ----- */
function RestaurantPreview({ accent, name }: { accent: string; name: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: '#1c1917' }}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${accent}55 0%, transparent 50%)`,
        }}
      />
      <div className="absolute left-2 top-2 flex items-center gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
        <UtensilsCrossed className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: accent }} />
        <span className="text-[7px] font-semibold uppercase tracking-[0.2em] text-stone-300 sm:text-[8px]">
          Signature
        </span>
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-3 sm:px-6">
        <div
          className="max-w-full truncate font-serif text-sm italic sm:text-base"
          style={{ color: accent }}
          title={name}
        >
          {name}
        </div>
        <div
          className="mt-1 h-px w-8 sm:w-10"
          style={{ backgroundColor: accent, opacity: 0.6 }}
        />
        <div className="mt-2 w-full space-y-1 sm:mt-3 sm:space-y-1.5">
          {[
            { dish: 'Tartare daurade', price: '14' },
            { dish: 'Ris de veau', price: '32' },
            { dish: 'Pavlova', price: '11' },
          ].map((row) => (
            <div key={row.dish} className="flex items-center gap-1 text-[8px] sm:gap-1.5 sm:text-[9px]">
              <span className="truncate text-stone-200">{row.dish}</span>
              <span
                className="flex-1 border-b border-dotted"
                style={{ borderColor: `${accent}88` }}
              />
              <span className="shrink-0" style={{ color: accent }}>
                {row.price}€
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----- BEAUTY : fond rosé pastel, gradients doux, ornement boudoir ----- */
function BeautyPreview({ accent, name }: { accent: string; name: string }) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 45%, #fbcfe8 100%)',
      }}
    >
      <div
        className="absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-40 sm:h-20 sm:w-20"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />
      <div
        className="absolute -left-4 bottom-4 h-12 w-12 rounded-full opacity-30 sm:h-16 sm:w-16"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />

      <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
        <Flower2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: accent }} strokeWidth={1.5} />
      </div>
      <div className="absolute right-2 top-2 text-[7px] uppercase tracking-[0.2em] text-pink-900/60 sm:right-3 sm:top-3 sm:text-[8px]">
        ✦ ✦ ✦
      </div>

      <div className="relative flex h-full flex-col items-center justify-center px-3 text-center">
        <div className="text-[8px] uppercase tracking-[0.3em] text-pink-900/60 sm:text-[9px]">
          Institut
        </div>
        <div
          className="mt-1 max-w-full truncate font-serif text-sm italic sm:text-base"
          style={{ color: accent }}
          title={name}
        >
          {name}
        </div>
        <div className="mt-2 flex items-center gap-1 sm:gap-1.5">
          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-[7px] uppercase tracking-[0.25em] text-pink-900/60 sm:text-[8px]">
            bien-être
          </span>
          <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accent }} />
        </div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex flex-wrap items-center justify-center gap-1 px-2 sm:gap-1.5">
        {['Soin', 'Coiffure', 'Spa'].map((label) => (
          <span
            key={label}
            className="rounded-full border bg-white/70 px-1.5 py-0.5 text-[7px] font-medium sm:px-2 sm:text-[8px]"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
