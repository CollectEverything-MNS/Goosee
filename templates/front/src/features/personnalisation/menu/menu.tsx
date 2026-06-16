'use client';

import { Loader2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminTitle } from '@/components/layout/admin/components/admin-title';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { LoaderError } from '@/components/ux/loader-error';
import MenuProvider, { useMenu } from '@/features/personnalisation/menu/context/menu-provider';
import { useMenuColumns } from '@/features/personnalisation/menu/components/menu-columns';
import { MenuFormDialog } from '@/features/personnalisation/menu/components/menu-form-dialog';
import { MenuListingToolbar } from '@/features/personnalisation/menu/components/menu-listing-toolbar';

import { useMenus } from './usecases/use-list-menus';
import { Menu as MenuType } from './types/menu.types';

const flattenMenus = (menus: MenuType[]): MenuType[] => {
  return menus.reduce<MenuType[]>((acc, menu) => {
    acc.push(menu);
    if (menu.children && menu.children.length > 0) {
      acc.push(...flattenMenus(menu.children));
    }
    return acc;
  }, []);
};

function MenuContent() {
  const t = useTranslations();
  const { setOpen, setCurrentRow } = useMenu();
  const { data, isLoading, error } = useMenus();
  const columns = useMenuColumns();
  const menus = data ? flattenMenus(data) : [];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <LoaderError message={error.message} />;
  }

  const handleAddNew = () => {
    setCurrentRow(null);
    setOpen('create');
  };

  return (
    <div className="space-y-6">
      <AdminTitle
        size="h1"
        title={t('admin.pageTitles.menu')}
        subtitle={t('admin.menu.count', { count: menus.length })}
        actions={
          <Button onClick={handleAddNew} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t('admin.menu.addNew')}
          </Button>
        }
      />
      <DataTable columns={columns} data={menus} Toolbar={MenuListingToolbar} />
      <MenuFormDialog />
    </div>
  );
}

export function Menu() {
  return (
    <MenuProvider>
      <MenuContent />
    </MenuProvider>
  );
}
