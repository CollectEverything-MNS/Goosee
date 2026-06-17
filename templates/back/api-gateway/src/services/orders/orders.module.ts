import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { CreateOrderController } from './usecases/create-order/create-order.controller';
import { ListOrdersController } from './usecases/list-orders/list-orders.controller';
import { GetOrderController } from './usecases/get-order/get-order.controller';
import { UpdateOrderStatusController } from './usecases/update-order-status/update-order-status.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [
    ListOrdersController,
    GetOrderController,
    CreateOrderController,
    UpdateOrderStatusController,
  ],
})
export class OrdersModule {}
