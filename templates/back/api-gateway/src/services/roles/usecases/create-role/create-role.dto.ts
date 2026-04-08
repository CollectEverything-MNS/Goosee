import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'REDACTEUR' })
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  name: string;

  @ApiPropertyOptional({ example: 'Peut éditer les pages et menus' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ example: ['pages', 'menu'], isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  pageKeys: string[];
}
