import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class AddItemDto {
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

  // Renseigné quand le visiteur est connecté : rattache le panier au client.
  @IsOptional()
  @IsUUID()
  customerId?: string;
}
