'use client'

import { HelpCircle, LogOut, Settings } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslations } from 'next-intl'

export const title = 'Profile Dropdown with Avatar'

export function AdminProfileDropdown() {
  const t = useTranslations()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative h-8 w-8 rounded-full bg-white text-primary" variant="ghost">
          <Avatar className={'flex items-center justify-center text-primary'}>RG</Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mt-3 w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Romain GILOT</p>
            <p className="text-xs leading-none text-muted-foreground">dev@romain-gilot.fr</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings />
          {t('admin.profileDropdown.settings')}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <HelpCircle />
          {t('admin.profileDropdown.support')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          {t('admin.profileDropdown.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
