import { api } from '@/lib/api-client';
import { useMutation } from '@tanstack/react-query';

const UPLOAD_ENDPOINT = '/upload';

interface UploadResponse {
  url: string;
  key: string;
}

const uploadFile = async (file: File, folder?: string): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const queryParams = folder ? `?folder=${folder}` : '';
  return api.upload<UploadResponse>(`${UPLOAD_ENDPOINT}${queryParams}`, formData);
};

export function useUploadFile() {
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadFile(file, folder),
  });
}
