'use client'
import PagesProvider from '@/features/personnalisation/pages/context/pages-provider'
import { DataTable } from '@/components/data-table/data-table'
import { getPagesColumns } from '@/features/personnalisation/pages/components/pages-columns'
import { PagesListingToolbar } from '@/features/personnalisation/pages/components/pages-listing-toolbar'

export function Pages() {
  return (
    <div>
      <PagesProvider>
        <DataTable columns={getPagesColumns()} data={[]} Toolbar={PagesListingToolbar} />
      </PagesProvider>
    </div>
  )
}
