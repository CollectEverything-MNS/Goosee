'use client';

import { useState } from 'react';
import { HelpCircle, LogOut, Settings } from 'lucide-react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { AdminModalSettings } from './admin-modal-settings/admin-modal-settings';
import { AdminSupportModal } from '@/components/layout/admin/components/admin-modal-settings/admin-modal-support';
import { useAuth } from '@/providers/auth-provider';

export function AdminProfileDropdown() {
  const t = useTranslations()
  const { user, logout } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '?';

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : '';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative h-8 w-8 rounded-full bg-card text-primary" variant="ghost">
            <Avatar className="flex items-center justify-center text-primary">{initials}</Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mt-3 w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings />
            {t('admin.profileDropdown.settings')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setSupportOpen(true)}>
            <HelpCircle />
            {t('admin.profileDropdown.support')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => logout()}>
            <LogOut />
            {t('admin.profileDropdown.logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AdminModalSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AdminSupportModal open={supportOpen} onOpenChange={setSupportOpen} />
    </>
  )
}
