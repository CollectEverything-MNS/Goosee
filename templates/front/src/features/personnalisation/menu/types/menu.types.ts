export interface Menu {
  id: string;
  label: string;
  pageId?: string;
  externalUrl?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  createdAt: string;
  updatedAt: string;
  children?: Menu[];
}

export interface CreateMenuDto {
  label: string;
  pageId?: string;
  externalUrl?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  openInNewTab?: boolean;
}

export interface UpdateMenuDto {
  label?: string;
  pageId?: string;
  externalUrl?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  openInNewTab?: boolean;
}

export interface ReorderMenusDto {
  items: { id: string; order: number }[];
}
