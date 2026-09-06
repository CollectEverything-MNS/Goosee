import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface ProductAttribute {
  id: string;
  key: string;
  value: string;
}

export interface ProductTag {
  id: string;
  name: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description?: string;
  price: number;
  preparationTime?: number;
  sizeValue?: number;
  sizeUnit?: string;
  isAvailable: boolean;
  categoryId: string;
  categoryIds?: string[];
  images: ProductImage[];
  tags: ProductTag[];
  attributes: ProductAttribute[];
}

interface GetProductResponse {
  message: string;
  product: ProductDetail;
}

const getProduct = async (id: string): Promise<ProductDetail> => {
  const data = await api.get<GetProductResponse>(`/products/${id}`);
  return (data as any)?.product ?? (data as unknown as ProductDetail);
};

export function useGetProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
    retry: false,
  });
}
