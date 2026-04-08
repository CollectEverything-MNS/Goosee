export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  pageKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  pageKeys: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  pageKeys?: string[];
}
