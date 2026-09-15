import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type OrderStatus = 'pending' | 'paid' | 'prepared' | 'shipped' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

export interface BillingAddress {
  fullName: string;
  line1: string;
  postalCode: string;
  city: string;
  country: string;
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

  @Column('jsonb', { nullable: true })
  billingAddress?: BillingAddress;

  @Column({ default: 'pending' })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt?: Date | null;

  constructor(partial: Partial<Order>) {
    Object.assign(this, partial);
  }
}
