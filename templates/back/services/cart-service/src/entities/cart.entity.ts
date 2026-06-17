import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface CartItem {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Identifiant du panier côté front : id client connecté ou jeton de session invité.
  @Index({ unique: true })
  @Column()
  sessionKey: string;

  // Référence au client connecté (UUID, pas de FK : database-per-service).
  @Column({ type: 'uuid', nullable: true })
  customerId?: string;

  @Column('jsonb', { default: () => "'[]'" })
  items: CartItem[];

  @Column('int', { default: 0 })
  totalCents: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Cart>) {
    Object.assign(this, partial);
  }

  // Recalcule le total à partir des lignes : le panier fait foi, jamais le front.
  recomputeTotal(): void {
    this.totalCents = (this.items ?? []).reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );
  }
}
