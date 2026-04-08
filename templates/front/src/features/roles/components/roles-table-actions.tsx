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
import { Edit, Trash, Lock } from 'lucide-react';
import { Row } from '@tanstack/react-table';
import { useRoles } from '../context/roles-provider';
import { Role } from '../data/role.types';

interface Props {
  row: Row<Role>;
}

export function RolesTableActions({ row }: Props) {
  const { setOpen, setCurrentRow } = useRoles();
  const role = row.original;

  if (role.isSystem) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Lock className="h-4 w-4" />
      </Button>
    );
  }

  return (
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
            setCurrentRow(role);
            setOpen('edit');
          }}
        >
          Modifier
          <DropdownMenuShortcut>
            <Edit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="!text-red-500"
          onClick={() => {
            setCurrentRow(role);
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
  );
}
