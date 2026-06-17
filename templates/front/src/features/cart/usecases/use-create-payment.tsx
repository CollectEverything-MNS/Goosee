import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface CreatePaymentInput {
  orderId: string;
  amountCents: number;
}

interface PaymentResponse {
  message: string;
  payment: {
    id: string;
    status: string;
    providerRef?: string;
  };
  // Secret remis par le prestataire (Stripe) pour confirmer le paiement côté front.
  clientSecret: string;
}

export function useCreatePayment() {
  return useMutation({
    mutationFn: async (input: CreatePaymentInput): Promise<PaymentResponse> => {
      return api.post<PaymentResponse>('/payments', input);
    },
  });
}
