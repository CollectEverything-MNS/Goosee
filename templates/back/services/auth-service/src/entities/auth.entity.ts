import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AuthToken } from './auth-token.entity';

export const DEFAULT_CUSTOMER_ROLE = 'CUSTOMER';

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'text',
    array: true,
    default: [DEFAULT_CUSTOMER_ROLE],
  })
  role: string[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'int', default: 0 })
  tokenVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => AuthToken, (token) => token.auth)
  tokens: AuthToken[];

  constructor(partial: Partial<Auth>) {
    Object.assign(this, partial);
  }
}
