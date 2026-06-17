import { Body, Controller, Param, Post } from '@nestjs/common';
import { AddItemDto } from './add-item.dto';
import { AddItemUseCase } from './add-item.usecase';

@Controller('cart')
export class AddItemController {
  constructor(private readonly addItemUseCase: AddItemUseCase) {}

  @Post(':sessionKey/items')
  async add(@Param('sessionKey') sessionKey: string, @Body() dto: AddItemDto) {
    return this.addItemUseCase.execute(sessionKey, dto);
  }
}
