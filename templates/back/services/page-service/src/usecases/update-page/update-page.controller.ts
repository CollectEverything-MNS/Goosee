import { Body, Controller, Param, Put } from '@nestjs/common';
import { UpdatePageUseCase } from './update-page.usecase';
import { UpdatePageDto } from './update-page.dto';

@Controller('pages')
export class UpdatePageController {
  constructor(private readonly updatePageUseCase: UpdatePageUseCase) {}

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.updatePageUseCase.execute(id, dto);
  }
}
