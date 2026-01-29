import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  label: string;

  @IsUUID()
  @IsOptional()
  pageId?: string;

  @IsString()
  @IsOptional()
  externalUrl?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean;
}
