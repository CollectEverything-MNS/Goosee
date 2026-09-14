import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface RgpdResultatService {
  service: string;
  statut: string;
  raison?: string;
}

export interface RgpdBilanEffacement {
  customerId: string;
  resultats: RgpdResultatService[];
}

const eraseCustomer = async (customerId: string): Promise<RgpdBilanEffacement> => {
  return api.post<RgpdBilanEffacement>(`/admin/rgpd/erase/${customerId}`);
};

export function useEraseCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: eraseCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Le jeton voyage dans l'en-tete Authorization, qu'une navigation directe
// n'emporte pas : le fichier est recupere puis remis au navigateur.
const exportCustomer = async (customerId: string): Promise<void> => {
  const blob = await api.get<Blob>(`/admin/rgpd/export/${customerId}`, {
    responseType: 'blob',
  });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = `donnees-client-${customerId}.json`;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
};

export function useExportCustomer() {
  return useMutation({
    mutationFn: exportCustomer,
  });
}
