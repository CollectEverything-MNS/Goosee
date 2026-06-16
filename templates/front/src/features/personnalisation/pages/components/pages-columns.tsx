import { Checkbox } from '@/components/ui/checkbox';
import { AdminStatusBadge } from '@/components/layout/admin/components/admin-status-badge';
import { PagesTableActions } from '@/features/personnalisation/pages/components/pages-table-actions';
import { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Page, PageStatus } from '../types/page.types';

export function usePagesColumns(): ColumnDef<Page>[] {
  const t = useTranslations()
  const locale = useLocale()

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: t('admin.pages.table.title'),
      cell: ({ row }) => {
        const page = row.original;
        return (
          <Link
            href={`/${locale}/${page.slug}`}
            className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
          >
            {page.title}
          </Link>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('admin.pages.table.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as PageStatus;
        const tone = status === PageStatus.PUBLISHED ? 'success' : 'neutral';
        return (
          <AdminStatusBadge tone={tone} withDot>
            {t(`admin.pages.status.${status}`)}
          </AdminStatusBadge>
        );
      },
      filterFn: (row, id, value) => {
        return value === row.getValue(id);
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => <PagesTableActions row={row} />,
    },
  ]
}
