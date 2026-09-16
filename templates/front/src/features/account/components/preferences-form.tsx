'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Bell, Globe, Mail } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const LOCALE_STORAGE_KEY = 'preferred-locale';
const NEWSLETTER_KEY = 'pref-newsletter';
const NOTIFICATIONS_KEY = 'pref-notifications';

const LANGUAGES = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
];

export function PreferencesForm() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [newsletter, setNewsletter] = useState(false);
  const [notifications, setNotifications] = useState(false);

  useEffect(() => {
    setNewsletter(localStorage.getItem(NEWSLETTER_KEY) === 'true');
    setNotifications(localStorage.getItem(NOTIFICATIONS_KEY) === 'true');
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    window.location.href = segments.join('/');
  };

  const handleNewsletter = (value: boolean) => {
    setNewsletter(value);
    localStorage.setItem(NEWSLETTER_KEY, String(value));
    toast.success(value ? 'Inscription à la newsletter activée' : 'Désinscription de la newsletter');
  };

  const handleNotifications = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem(NOTIFICATIONS_KEY, String(value));
    toast.success(value ? 'Notifications activées' : 'Notifications désactivées');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Langue</Label>
            <p className="text-xs text-muted-foreground">Langue d&apos;affichage du site</p>
          </div>
        </div>
        <Select value={currentLocale} onValueChange={handleLanguageChange}>
          <SelectTrigger aria-label="Langue" className="w-40">
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

      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Newsletter</Label>
            <p className="text-xs text-muted-foreground">Recevoir nos offres et nouveautés par email</p>
          </div>
        </div>
        <Switch aria-label="Newsletter" checked={newsletter} onCheckedChange={handleNewsletter} />
      </div>

      <div className="flex items-center justify-between gap-4 border-t pt-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Notifications</Label>
            <p className="text-xs text-muted-foreground">Alertes sur le suivi de mes commandes</p>
          </div>
        </div>
        <Switch aria-label="Notifications" checked={notifications} onCheckedChange={handleNotifications} />
      </div>
    </div>
  );
}
