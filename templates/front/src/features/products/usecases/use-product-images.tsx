import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isMain: boolean;
  order: number;
}

interface ImagesResponse {
  message: string;
  images: ProductImage[];
}

const getProductImages = async (productId: string): Promise<ProductImage[]> => {
  const data = await api.get<ImagesResponse>(`/products/${productId}/images`);
  return (data as any)?.images ?? [];
};

export function useProductImages(productId?: string) {
  return useQuery({
    queryKey: ['product-images', productId],
    queryFn: () => getProductImages(productId as string),
    enabled: Boolean(productId),
  });
}

function useInvalidateImages(productId?: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['product-images', productId] });
    queryClient.invalidateQueries({ queryKey: ['product', productId] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useAddProductImage(productId?: string) {
  const invalidate = useInvalidateImages(productId);
  return useMutation({
    mutationFn: async ({ file, isMain }: { file: File; isMain?: boolean }) => {
      const formData = new FormData();
      formData.append('file', file);
      const query = isMain ? '?isMain=true' : '';
      return api.upload(`/products/${productId}/images${query}`, formData);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteProductImage(productId?: string) {
  const invalidate = useInvalidateImages(productId);
  return useMutation({
    mutationFn: (imageId: string) => api.delete(`/products/${productId}/images/${imageId}`),
    onSuccess: invalidate,
  });
}

export function useSetMainProductImage(productId?: string) {
  const invalidate = useInvalidateImages(productId);
  return useMutation({
    mutationFn: (imageId: string) =>
      api.put(`/products/${productId}/images/${imageId}/main`),
    onSuccess: invalidate,
  });
}
