'use client';

import { useTranslations } from 'next-intl';
import { AdminModalSettingsRaw } from './admin-modal-settings-raw';

export function AdminModalSettingsAccountSection() {
  const t = useTranslations('admin.settings.account');

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">{t('title')}</h2>

      <section className="space-y-4">
        <h3 className="text-sm font-medium">{t('profile')}</h3>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <button className="text-sm text-primary hover:underline">
            {t('createPortrait')}
          </button>
        </div>

        <div className="max-w-sm">
          <label className="text-xs text-muted-foreground">{t('name')}</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            defaultValue="Romain"
          />
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium">{t('accountSecurity')}</h3>

        <AdminModalSettingsRaw
          title={t('email')}
          description="romain@lesentrecodeurs.com"
          action={t('change')}
        />

        <AdminModalSettingsRaw
          title={t('password')}
          description={t('changePassword')}
          action={t('modify')}
        />
      </section>
    </div>
  )
}
