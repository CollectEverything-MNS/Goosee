'use client';
import { DataTable } from '@/components/data-table/data-table';
import { getLogsColumns } from './components/logs-columns';
import { LogsListingToolbar } from './components/logs-listing-toolbar';
import { useListLogs } from './usecases/use-list-logs';

export function Logs() {
  const { data: logs = [] } = useListLogs();

  return (
    <div>
      <DataTable columns={getLogsColumns()} data={logs} Toolbar={LogsListingToolbar} />
    </div>
  );
}
