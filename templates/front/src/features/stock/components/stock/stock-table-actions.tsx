'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { History, Pencil } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { routes } from '@/config/routes.config';

import { useStock } from '../../context/stock-provider';

interface Props {
  row: Row<any>;
}

export function StockTableActions({ row }: Props) {
  const t = useTranslations('admin.stock.actions');
  const locale = useLocale();
  const router = useRouter();
  const { setOpen, setCurrentRow } = useStock();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="ml-auto flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(row.original);
            setOpen('adjust');
          }}
        >
          {t('adjust')}
          <DropdownMenuShortcut>
            <Pencil size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            router.push(routes.gooseeAdmin.stockMovements.getHref(locale, row.original.productId))
          }
        >
          {t('history')}
          <DropdownMenuShortcut>
            <History size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
