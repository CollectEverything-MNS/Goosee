import { Payment } from '../entities/payment.entity';

export abstract class IPaymentRepository {
  abstract save(payment: Payment): Promise<Payment>;
  abstract findById(id: string): Promise<Payment | null>;
  abstract findByProviderRef(providerRef: string): Promise<Payment | null>;
}
