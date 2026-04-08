import { useTranslations } from 'next-intl';
import { useListRoles } from '@/features/roles/usecases/use-list-roles';

const SYSTEM_BADGE_CLASSES: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-800 border-purple-200',
  SUPERADMIN: 'bg-red-100 text-red-800 border-red-200',
  ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
  CUSTOMER: 'bg-green-100 text-green-800 border-green-200',
};

const FALLBACK_BADGE = 'bg-gray-100 text-gray-800 border-gray-200';
const TRANSLATABLE_ROLES = new Set(['OWNER', 'CUSTOMER']);

export const getRoleBadgeClass = (roleName: string): string => {
  return SYSTEM_BADGE_CLASSES[roleName] ?? FALLBACK_BADGE;
};

export function useRoleLabel() {
  const t = useTranslations('admin.roles.labels');
  return (roleName: string): string => {
    if (TRANSLATABLE_ROLES.has(roleName)) {
      return t(roleName);
    }
    return roleName;
  };
}

export function useRolesOptions() {
  const { data: roles = [], isLoading } = useListRoles();
  const getRoleLabel = useRoleLabel();

  const options = roles.map((r) => ({
    value: r.name,
    label: getRoleLabel(r.name),
  }));

  return { options, isLoading };
}
