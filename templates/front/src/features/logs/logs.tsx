'use client';

import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';

import { getLogsColumns } from './components/logs-columns';
import { LogsListingToolbar } from './components/logs-listing-toolbar';
import { useListLogs } from './usecases/use-list-logs';

export function Logs() {
  const t = useTranslations();
  const { data: logs = [] } = useListLogs();

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.logs')}
        subtitle={t('admin.logs.count', { count: logs.length })}
      />
      <DataTable columns={getLogsColumns()} data={logs} Toolbar={LogsListingToolbar} />
    </div>
  );
}
