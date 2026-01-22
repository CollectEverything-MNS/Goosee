'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Settings, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AdminModalSettingsAccountSection } from './admin-modal-settings-account-section';
import { AdminModalSettingsPreferencesSection } from './admin-modal-settings-preferences-section';

const NAV_ITEMS = [
  { id: 'account', labelKey: 'account', icon: User },
  { id: 'preferences', labelKey: 'preferences', icon: Settings },
  { id: 'security', labelKey: 'security', icon: Shield },
]

export function AdminModalSettings({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('admin.settings');
  const [active, setActive] = useState('account')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {t('title')}
        </DialogTitle>

        <div className="flex h-[80vh]">
          <aside className="w-64 border-r bg-muted/40 p-4">
            <div className="mb-4 text-sm font-semibold text-muted-foreground">
              {t('sidebarTitle')}
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
                      active === item.id && 'bg-muted font-medium'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(`nav.${item.labelKey}`)}
                  </button>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1 overflow-y-auto p-8">
            {active === 'account' && <AdminModalSettingsAccountSection />}
            {active === 'preferences' && <AdminModalSettingsPreferencesSection />}
          </main>
        </div>
      </DialogContent>
    </Dialog>
  )
}
