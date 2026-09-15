import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Une trace de cette categorie enregistre un traitement, pas l'activite d'une
// personne : l'article 5.2 demande de pouvoir demontrer qu'un effacement a eu
// lieu. La purge RGPD l'ecarte, sans quoi rejouer un effacement detruirait la
// preuve du precedent — constate a l'execution le 15/09.
export const CATEGORIE_PREUVE_RGPD = 'rgpd-preuve';

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

  // Type explicite : avec `string | null`, emitDecoratorMetadata emet `Object`
  // et TypeORM leve DataTypeNotSupportedError au demarrage.
  @Column({ type: 'varchar', nullable: true })
  categorie?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
