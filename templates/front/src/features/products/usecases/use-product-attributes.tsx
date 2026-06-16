import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface ProductAttribute {
  id: string;
  productId: string;
  key: string;
  value: string;
}

interface AttributesResponse {
  message: string;
  attributes: ProductAttribute[];
}

const getAttributes = async (productId: string): Promise<ProductAttribute[]> => {
  const data = await api.get<AttributesResponse>(`/products/${productId}/attributes`);
  return (data as any)?.attributes ?? [];
};

export function useProductAttributes(productId?: string) {
  return useQuery({
    queryKey: ['product-attributes', productId],
    queryFn: () => getAttributes(productId as string),
    enabled: Boolean(productId),
  });
}

function useInvalidateAttributes(productId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['product-attributes', productId] });
    queryClient.invalidateQueries({ queryKey: ['product', productId] });
  };
}

export function useAddProductAttribute(productId?: string) {
  const invalidate = useInvalidateAttributes(productId);
  return useMutation({
    mutationFn: (data: { key: string; value: string }) =>
      api.post(`/products/${productId}/attributes`, data),
    onSuccess: invalidate,
  });
}

export function useDeleteProductAttribute(productId?: string) {
  const invalidate = useInvalidateAttributes(productId);
  return useMutation({
    mutationFn: (attributeId: string) =>
      api.delete(`/products/${productId}/attributes/${attributeId}`),
    onSuccess: invalidate,
  });
}
