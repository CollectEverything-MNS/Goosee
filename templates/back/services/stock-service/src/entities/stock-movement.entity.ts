import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stock_movement')
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'int' })
  delta: number;

  @Column({ type: 'uuid', nullable: true })
  orderId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
