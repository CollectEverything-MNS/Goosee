'use client';

import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Globe, Moon, Sun, Monitor } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const LOCALE_STORAGE_KEY = 'preferred-locale';

const LANGUAGES = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

const THEMES = [
  { value: 'light', labelKey: 'light', icon: Sun },
  { value: 'dark', labelKey: 'dark', icon: Moon },
  { value: 'system', labelKey: 'system', icon: Monitor },
];

export function AdminModalSettingsPreferencesSection() {
  const t = useTranslations('admin.settings.preferences');
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    window.location.href = newPath;
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <section className="space-y-6">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t('display')}
        </h3>

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">{t('language')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('languageDescription')}
                </p>
              </div>
            </div>
            <Select value={currentLocale} onValueChange={handleLanguageChange}>
              <SelectTrigger aria-label={t('language')} className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : theme === 'light' ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Monitor className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-sm font-medium">{t('theme')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('themeDescription')}
                </p>
              </div>
            </div>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger aria-label={t('theme')} className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((themeOption) => {
                  const Icon = themeOption.icon;
                  return (
                    <SelectItem key={themeOption.value} value={themeOption.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{t(`themes.${themeOption.labelKey}`)}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
}
