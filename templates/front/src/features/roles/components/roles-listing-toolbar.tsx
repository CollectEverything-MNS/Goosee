import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';

interface Props {
  table: any;
}

export function RolesListingToolbar({ table }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-x-3">
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
      </div>
    </div>
  );
}
