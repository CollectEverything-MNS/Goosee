import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { GetCartController } from './usecases/get-cart/get-cart.controller';
import { AddItemController } from './usecases/add-item/add-item.controller';
import { UpdateItemController } from './usecases/update-item/update-item.controller';
import { RemoveItemController } from './usecases/remove-item/remove-item.controller';
import { ClearCartController } from './usecases/clear-cart/clear-cart.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [
    GetCartController,
    AddItemController,
    UpdateItemController,
    RemoveItemController,
    ClearCartController,
  ],
})
export class CartModule {}
