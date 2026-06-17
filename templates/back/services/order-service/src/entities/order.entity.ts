import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Référence au client acheteur (UUID, pas de FK : database-per-service).
  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @Column()
  customerEmail: string;

  @Column('jsonb')
  items: OrderItem[];

  @Column('int')
  totalCents: number;

  @Column({ default: 'pending' })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}
