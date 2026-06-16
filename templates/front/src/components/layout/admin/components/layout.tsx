'use client';

import React from 'react';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { AdminProfileDropdown } from './admin-profile-dropdown';
import { AdminSearchbar } from './admin-searchbar';
import { AdminSidebar } from './admin-sidebar';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="bg-muted/30">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 lg:px-6">
          <SidebarTrigger className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-muted hover:text-foreground" />
          <div className="mx-auto w-full max-w-2xl">
            <AdminSearchbar />
          </div>
          <div className="flex items-center gap-3">
            <AdminProfileDropdown />
          </div>
        </header>
        <main className="flex-1 px-6 py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
