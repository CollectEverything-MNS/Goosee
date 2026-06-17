import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: ORDER_STATUSES, example: 'paid' })
  @IsIn(ORDER_STATUSES)
  status: OrderStatus;
}
