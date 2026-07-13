import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TicketStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  DONE = 'DONE',
}

@Entity('ticket')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  authorId: string;

  @Column()
  authorEmail: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.CREATED,
  })
  status: TicketStatus;

  @Column({ nullable: true })
  assignedTo?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
