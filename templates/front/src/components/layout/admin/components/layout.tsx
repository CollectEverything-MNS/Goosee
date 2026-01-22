'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import { AdminSidebar } from '@/components/layout/admin/components/admin-sidebar';
import { AdminSearchbar } from '@/components/layout/admin/components/admin-searchbar';
import { AdminProfileDropdown } from './admin-profile-dropdown';

interface Props {
  children: React.ReactNode
  breadcrumb?: React.ReactNode
}

export default function AdminLayout({ children, breadcrumb }: Props) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-[#1D3647]">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumb}
          </div>
          <div className={'flex items-center gap-2 px-3'}>
            <AdminSearchbar />
            <AdminProfileDropdown />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
