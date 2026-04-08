import { DataTableSearch } from '@/components/data-table/data-table-search';
import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRoles } from '../context/roles-provider';

interface Props {
  table: any;
}

export function RolesListingToolbar({ table }: Props) {
  const t = useTranslations();
  const { setOpen } = useRoles();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-x-3">
        <DataTableViewOptions table={table} />
        <DataTableSearch table={table} />
      </div>
      <div className="flex items-center">
        <Button variant="default" onClick={() => setOpen('create')}>
          <Plus /> <div className="hidden md:block">{t('admin.roles.addNewRole')}</div>
        </Button>
      </div>
    </div>
  );
}
