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
  Length,
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

export class BillingAddressDto {
  @ApiProperty({ example: 'Jean Dupont' })
  @IsString()
  @Length(2, 120)
  fullName: string;

  @ApiProperty({ example: '10 rue de la Paix' })
  @IsString()
  @Length(2, 160)
  line1: string;

  @ApiProperty({ example: '57000' })
  @IsString()
  @Length(2, 20)
  postalCode: string;

  @ApiProperty({ example: 'Metz' })
  @IsString()
  @Length(2, 80)
  city: string;

  @ApiProperty({ example: 'France' })
  @IsString()
  @Length(2, 80)
  country: string;
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

  @ApiPropertyOptional({ type: BillingAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;
}
