import { IsInt, Min } from 'class-validator';

export class UpdateItemDto {
  // Quantité absolue ; 0 retire la ligne du panier.
  @IsInt()
  @Min(0)
  quantity: number;
}
