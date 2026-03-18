export type RoleKey = 'OWNER' | 'SUPERADMIN' | 'ADMIN' | 'CUSTOMER';

export interface RoleData {
  label: string;
  badgeClass: string;
}

export const ROLES_DATA: Record<RoleKey, RoleData> = {
  OWNER: {
    label: 'Propriétaire',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  SUPERADMIN: {
    label: 'Super Admin',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
  },
  ADMIN: {
    label: 'Administrateur',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  CUSTOMER: {
    label: 'Client',
    badgeClass: 'bg-green-100 text-green-800 border-green-200',
  },
};

export const ROLES_LIST = Object.entries(ROLES_DATA).map(([key, data]) => ({
  value: key as RoleKey,
  label: data.label,
}));
