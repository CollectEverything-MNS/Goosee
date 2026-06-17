import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateItemDto {
  @ApiProperty({ example: 3, description: 'Quantité absolue ; 0 retire la ligne' })
  @IsInt()
  @Min(0)
  quantity: number;
}
