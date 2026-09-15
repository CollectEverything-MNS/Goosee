import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { isAxiosError } from 'axios';
import { Download, Edit, ShieldAlert, Trash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Row } from '@tanstack/react-table';
import { useExportCustomer } from '@/features/clients/usecases/use-rgpd-actions';
import { useAuth } from '@/providers/auth-provider';
import { useClient } from '../context/clients-provider';

interface Props {
  row: Row<any>
}

export function ClientsTableActions({ row }: Props) {
  const t = useTranslations('admin.clients.rgpd');
  const { setOpen, setCurrentRow } = useClient();
  const { canAccess } = useAuth();
  const exportMutation = useExportCustomer();

  const peutRgpd = canAccess('rgpd');

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(row.original.id);
      toast.success(t('export.success'));
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        toast.error(t('export.error'));
      }
    }
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="ml-auto flex h-8 w-8 cursor-pointer p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('edit');
            }}
          >
            Modifier
            <DropdownMenuShortcut>
              <Edit size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          {peutRgpd && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={exportMutation.isPending} onClick={handleExport}>
                {t('export.action')}
                <DropdownMenuShortcut>
                  <Download size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="!text-red-500"
                onClick={() => {
                  setCurrentRow(row.original);
                  setOpen('rgpd-erase');
                }}
              >
                {t('erase.action')}
                <DropdownMenuShortcut>
                  <ShieldAlert size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="!text-red-500"
            onClick={() => {
              setCurrentRow(row.original);
              setOpen('delete');
            }}
          >
            Supprimer
            <DropdownMenuShortcut>
              <Trash size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
