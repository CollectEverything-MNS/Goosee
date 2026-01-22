import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PageComponent, PageStatus, PageType } from '../../entities/page.entity';

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;

  @IsEnum(PageType)
  @IsOptional()
  type?: PageType;

  @IsArray()
  @IsOptional()
  components?: PageComponent[];

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}
