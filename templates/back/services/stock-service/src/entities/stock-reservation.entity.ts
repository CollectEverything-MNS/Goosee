import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type StockReservationStatus = 'held' | 'confirmed' | 'released';

@Entity('stock_reservation')
export class StockReservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  productId: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', default: 'held' })
  status: StockReservationStatus;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
