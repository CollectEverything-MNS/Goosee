import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Référence à la commande réglée (UUID, pas de FK : database-per-service).
  @Column({ type: 'uuid' })
  orderId: string;

  @Column('int')
  amountCents: number;

  @Column({ default: 'eur' })
  currency: string;

  @Column({ default: 'pending' })
  status: PaymentStatus;

  // Prestataire de paiement (stripe par défaut) et son identifiant côté provider
  // (PaymentIntent Stripe), renseigné à la création de l'intention.
  @Column({ default: 'stripe' })
  provider: string;

  @Index()
  @Column({ nullable: true })
  providerRef?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial);
  }
}
