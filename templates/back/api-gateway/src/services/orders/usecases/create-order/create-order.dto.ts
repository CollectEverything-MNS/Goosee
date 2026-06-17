import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
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

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'uuid-client' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ example: 'client@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
