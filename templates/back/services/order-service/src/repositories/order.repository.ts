import { Order } from '../entities/order.entity';

export abstract class IOrderRepository {
  abstract save(order: Order): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract list(): Promise<Order[]>;
  abstract findByCustomer(customerId: string): Promise<Order[]>;
}
