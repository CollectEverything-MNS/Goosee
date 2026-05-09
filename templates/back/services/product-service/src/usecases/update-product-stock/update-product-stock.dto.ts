import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateProductStockDto {
  @ApiProperty({ example: -1 })
  @IsNumber()
  quantity: number;
}
