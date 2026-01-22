'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function AdminSearchbar() {
  const t = useTranslations()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="hidden h-8 w-[300px] items-center justify-between rounded-md border bg-background px-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground md:flex"
      >
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>{t('admin.search')}</span>
        </div>

        <div className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</span>K
        </div>
      </Button>
      <Button variant={'ghost'} onClick={() => setOpen(true)} className={'text-white md:hidden'}>
        <Search />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t('admin.search')} />
        <CommandList>
          <CommandEmpty>{t('admin.noResults')}</CommandEmpty>

          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem>
              Profile <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Billing <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Settings <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
