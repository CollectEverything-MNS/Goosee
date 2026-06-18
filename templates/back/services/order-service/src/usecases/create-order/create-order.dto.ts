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
  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  unitPriceCents: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class BillingAddressDto {
  @IsString()
  @Length(2, 120)
  fullName: string;

  @IsString()
  @Length(2, 160)
  line1: string;

  @IsString()
  @Length(2, 20)
  postalCode: string;

  @IsString()
  @Length(2, 80)
  city: string;

  @IsString()
  @Length(2, 80)
  country: string;
}

export class CreateOrderDto {
  // Client connecté facultatif : une commande peut être passée en invité.
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsEmail()
  customerEmail: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;
}
