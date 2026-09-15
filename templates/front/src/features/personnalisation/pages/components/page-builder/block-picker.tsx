'use client';

import { useMemo, useState } from 'react';
import {
  Grid3X3,
  Heading,
  Image,
  Layout,
  List,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Minus,
  MousePointerClick,
  MoveVertical,
  Navigation,
  Package,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Type,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  COMPONENT_DEFINITIONS,
  ComponentCategory,
  ComponentType,
} from '../../types/page.types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: Layout,
  type: Type,
  heading: Heading,
  image: Image,
  'grid-3x3': Grid3X3,
  megaphone: Megaphone,
  'shopping-bag': ShoppingBag,
  sparkles: Sparkles,
  quote: MessageSquareQuote,
  'separator-horizontal': MoveVertical,
  'mouse-pointer-click': MousePointerClick,
  minus: Minus,
  list: List,
  mail: Mail,
  play: Play,
  navigation: Navigation,
  package: Package,
  'message-square': MessageSquareQuote,
  'shield-check': ShieldCheck,
  'shopping-cart': ShoppingCart,
};

const CATEGORY_ORDER: ComponentCategory[] = ['layout', 'basic', 'ecommerce'];

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (type: ComponentType) => void;
}

export function BlockPicker({ open, onClose, onPick }: Props) {
  const t = useTranslations('admin.pageBuilder');
  const [query, setQuery] = useState('');

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATEGORY_ORDER.map((cat) => {
      const items = COMPONENT_DEFINITIONS.filter((def) => def.category === cat).filter((def) => {
        if (!q) return true;
        const label = (() => {
          try {
            return t(`components.${def.type}`).toLowerCase();
          } catch {
            return def.label.toLowerCase();
          }
        })();
        return label.includes(q) || def.type.includes(q);
      });
      return { category: cat, items };
    }).filter((g) => g.items.length > 0);
  }, [query, t]);

  const handlePick = (type: ComponentType) => {
    onPick(type);
    onClose();
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="space-y-3 border-b border-border bg-muted/30 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="space-y-0.5 text-left">
              <DialogTitle className="text-base font-semibold">
                {t('picker.title')}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {t('picker.subtitle')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border-b border-border bg-background px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('picker.searchPlaceholder')}
              aria-label={t('picker.searchPlaceholder')}
              className="h-10 pl-9"
            />
          </div>
        </div>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-5">
          {grouped.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">{t('picker.empty')}</p>
          )}
          {grouped.map(({ category, items }) => (
            <section key={category} className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`categories.${category}`)}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((def) => {
                  const Icon = ICONS[def.icon] || Layout;
                  const label = (() => {
                    try {
                      return t(`components.${def.type}`);
                    } catch {
                      return def.label;
                    }
                  })();
                  return (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => handlePick(def.type)}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-3 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-foreground" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
