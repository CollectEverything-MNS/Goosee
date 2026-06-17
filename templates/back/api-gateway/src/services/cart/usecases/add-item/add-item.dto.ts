import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ example: 'uuid-produit' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'Château Margaux 2019' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1299 })
  @IsInt()
  @Min(0)
  unitPriceCents: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: 'uuid-client' })
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
