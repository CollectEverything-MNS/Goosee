import { Page, PageStatus, PageType } from '@/features/personnalisation/pages/types/page.types';

export interface PagesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PageStatus;
  type?: PageType;
}

export interface PagesListResponse {
  data: Page[];
  total: number;
  page: number;
  limit: number;
}