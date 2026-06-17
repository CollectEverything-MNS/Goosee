import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @Length(2, 150) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) stock?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) preparationTime?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) sizeValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sizeUnit?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAvailable?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiPropertyOptional({ isArray: true }) @IsOptional() @IsArray() @ArrayNotEmpty() @IsUUID(undefined, { each: true }) categoryIds?: string[];
}
