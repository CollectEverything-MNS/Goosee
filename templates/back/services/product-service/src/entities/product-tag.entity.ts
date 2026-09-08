import { Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('product_tag')
@Unique(['productId', 'tagId'])
export class ProductTag {
  @PrimaryColumn('uuid')
  productId: string;

  @PrimaryColumn('uuid')
  tagId: string;
}
