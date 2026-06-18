import { IsIn } from 'class-validator';
import { OrderStatus } from '../../entities/order.entity';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'prepared', 'shipped', 'cancelled'];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES)
  status: OrderStatus;
}
