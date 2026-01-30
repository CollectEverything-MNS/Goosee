import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum PageType {
  HOME = 'home',
  CATALOG = 'catalog',
  CONTACT = 'contact',
  CUSTOM = 'custom',
}

export interface PageComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  order: number;
  children?: PageComponent[];
}

export class CreatePageDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

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
