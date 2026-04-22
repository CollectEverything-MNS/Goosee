import { Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('product_tag')
@Unique(['productId', 'tagId'])
export class ProductTag {
  @PrimaryColumn()
  productId: string;

  @PrimaryColumn()
  tagId: string;
}