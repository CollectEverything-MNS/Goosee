import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({ example: 'Mon Site', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'Description du site', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: 'https://example.com/favicon.ico', required: false })
  @IsString()
  @IsOptional()
  faviconUrl?: string;

  @ApiProperty({ example: '#3b82f6', required: false })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({ example: {}, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
