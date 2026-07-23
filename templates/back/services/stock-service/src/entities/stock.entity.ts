import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  productId: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
