import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

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

  @ApiPropertyOptional({ example: 'uuid-de-la-categorie' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: ['uuid-categorie-1', 'uuid-categorie-2'], isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID(undefined, { each: true })
  categoryIds?: string[];
}
