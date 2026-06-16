'use client';

import { useEffect } from 'react';

import { useSettings } from '@/features/personnalisation/settings/usecases/use-get-settings';

function normalizeHex(hex: string): string | null {
  if (!hex) return null;
  let h = hex.trim().replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return h.toLowerCase();
}

function hexToHsl(hex: string): string | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function getRelativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex);
  if (!normalized) return 0;
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = toLinear(parseInt(normalized.slice(0, 2), 16));
  const g = toLinear(parseInt(normalized.slice(2, 4), 16));
  const b = toLinear(parseInt(normalized.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const VARS_MANAGED = ['--primary', '--ring', '--sidebar-ring', '--primary-foreground'] as const;

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useSettings();
  const primaryColor = settings?.primaryColor;

  useEffect(() => {
    const root = document.documentElement;
    const previous = VARS_MANAGED.map((name) => ({
      name,
      value: root.style.getPropertyValue(name),
    }));

    const hsl = primaryColor ? hexToHsl(primaryColor) : null;
    if (hsl) {
      const luminance = getRelativeLuminance(primaryColor!);
      const foreground = luminance > 0.55 ? '222 47% 11%' : '0 0% 100%';
      root.style.setProperty('--primary', hsl);
      root.style.setProperty('--ring', hsl);
      root.style.setProperty('--sidebar-ring', hsl);
      root.style.setProperty('--primary-foreground', foreground);
    }

    return () => {
      for (const { name, value } of previous) {
        if (value) {
          root.style.setProperty(name, value);
        } else {
          root.style.removeProperty(name);
        }
      }
    };
  }, [primaryColor]);

  return <>{children}</>;
}
