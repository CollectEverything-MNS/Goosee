import { Body, Controller, Param, Patch } from '@nestjs/common';
import { UpdateItemDto } from './update-item.dto';
import { UpdateItemUseCase } from './update-item.usecase';

@Controller('cart')
export class UpdateItemController {
  constructor(private readonly updateItemUseCase: UpdateItemUseCase) {}

  @Patch(':sessionKey/items/:productId')
  async update(
    @Param('sessionKey') sessionKey: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateItemDto
  ) {
    return this.updateItemUseCase.execute(sessionKey, productId, dto);
  }
}
