'use client';

import MenuProvider from '@/features/personnalisation/menu/context/menu-provider';
import { DataTable } from '@/components/data-table/data-table';
import { useMenuColumns } from '@/features/personnalisation/menu/components/menu-columns';
import { Loader2 } from 'lucide-react';
import { useMenus } from './usecases/use-list-menus';
import { LoaderError } from '@/components/ux/loader-error';
import { MenuListingToolbar } from '@/features/personnalisation/menu/components/menu-listing-toolbar';
import { MenuFormDialog } from '@/features/personnalisation/menu/components/menu-form-dialog';
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

export function Menu() {
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

  return (
    <div>
      <MenuProvider>
        <DataTable
          columns={columns}
          data={menus}
          Toolbar={MenuListingToolbar}
        />
        <MenuFormDialog />
      </MenuProvider>
    </div>
  );
}
