import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Château Margaux 2019' })
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiPropertyOptional({ example: 'Grand vin de Bordeaux...' })
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  description?: string;

  @ApiProperty({ example: 1299 })
  @IsNumber()
  @Min(1)
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeValue?: number;

  @ApiPropertyOptional({ example: 'cl' })
  @IsOptional()
  @IsString()
  sizeUnit?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'uuid-de-la-categorie' })
  @IsUUID()
  categoryId: string;
}
