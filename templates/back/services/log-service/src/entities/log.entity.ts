import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  DEBUG = 'DEBUG',
}

@Entity('log')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  service?: string;

  @Column({
    type: 'enum',
    enum: LogLevel,
    nullable: true,
  })
  level?: LogLevel;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
