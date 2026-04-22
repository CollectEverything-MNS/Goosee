import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('product_attribute')
export class ProductAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @Column()
  key: string;

  @Column()
  value: string;
}