import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(1)
  amountCents: number;

  // Devise ISO 4217 (eur par défaut côté usecase).
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
