import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const decimalToNumber = {
  to: (value?: number) => value,
  from: (value: string | null) => (value == null ? null : Number(value)),
};

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, transformer: decimalToNumber })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 0 })
  preparationTime: number;

  @Column({ nullable: true, type: 'float' })
  sizeValue: number;

  @Column({ nullable: true })
  sizeUnit: string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column()
  categoryId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  constructor(partial: Partial<Product>) {
    Object.assign(this, partial);
  }
}
