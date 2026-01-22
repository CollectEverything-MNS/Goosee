'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminModalSettingsRaw } from './admin-modal-settings-raw';
import { useTranslations } from 'next-intl';
import {
  AdminModalSettingsAccountChangePasswordModal,
} from '@/components/layout/admin/components/admin-modal-settings/admin-modal-settings-account-change-password-modal';
import {
  AdminModalSettingsAccountChangeEmailModal,
} from '@/components/layout/admin/components/admin-modal-settings/admin-modal-settings-account-email-modal';

export function AdminModalSettingsAccountSection() {
  const t = useTranslations('admin.settings.account');
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

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
          <Label>{t('name')}</Label>
          <Input className="mt-1" defaultValue="Romain" />
        </div>
      </section>

      <section className="space-y-4 border-t pt-6">
        <h3 className="text-sm font-medium">{t('accountSecurity')}</h3>

        <AdminModalSettingsRaw
          title={t('email')}
          description="romain@lesentrecodeurs.com"
          action={t('change')}
          onClick={() => setIsEmailOpen(true)}

        />

        <AdminModalSettingsRaw
          title={t('password')}
          description={t('changePassword')}
          action={t('modify')}
          onClick={() => setIsPasswordOpen(true)}
        />
      </section>

      <AdminModalSettingsAccountChangePasswordModal
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />
      <AdminModalSettingsAccountChangeEmailModal
        open={isEmailOpen}
        onOpenChange={setIsEmailOpen}
      />
    </div>
  );
}
