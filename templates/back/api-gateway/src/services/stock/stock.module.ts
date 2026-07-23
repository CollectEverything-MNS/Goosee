import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { GetStockController } from './usecases/get-stock/get-stock.controller';
import { ListStockController } from './usecases/list-stock/list-stock.controller';
import { AdjustStockController } from './usecases/adjust-stock/adjust-stock.controller';
import { ListStockMovementsController } from './usecases/list-stock-movements/list-stock-movements.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [
    GetStockController,
    ListStockController,
    AdjustStockController,
    ListStockMovementsController,
  ],
  providers: [],
  exports: [],
})
export class StockModule {}
