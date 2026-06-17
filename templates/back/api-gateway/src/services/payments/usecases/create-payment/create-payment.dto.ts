import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-commande' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 7598 })
  @IsInt()
  @Min(1)
  amountCents: number;

  @ApiPropertyOptional({ example: 'eur' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
