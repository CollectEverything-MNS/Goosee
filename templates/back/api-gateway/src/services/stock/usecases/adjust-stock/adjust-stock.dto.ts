import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ example: 10, description: 'Delta : positif ou négatif' })
  @IsInt()
  quantity: number;
}
