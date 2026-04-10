import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Auth } from './auth.entity';

export const AUTH_TOKEN_TYPES = {
  refresh: 'REFRESH',
  passwordReset: 'PASSWORD_RESET',
  emailVerification: 'EMAIL_VERIFICATION',
} as const;

export type AuthTokenType =
  (typeof AUTH_TOKEN_TYPES)[keyof typeof AUTH_TOKEN_TYPES];

@Entity('auth_token')
@Index(['token', 'type'], { unique: true })
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authId: string;

  @Column()
  token: string;

  @Column({ default: AUTH_TOKEN_TYPES.refresh })
  type: AuthTokenType;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiredAt: Date;

  @ManyToOne(() => Auth, (auth) => auth.tokens)
  @JoinColumn({ name: 'authId' })
  auth: Auth;

  constructor(partial: Partial<AuthToken>) {
    Object.assign(this, partial);
  }
}
