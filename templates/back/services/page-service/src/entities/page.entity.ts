import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export enum PageType {
  HOME = 'home',
  CATALOG = 'catalog',
  CONTACT = 'contact',
  CUSTOM = 'custom',
}

export interface PageComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  order: number;
}

@Entity('pages')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'enum', enum: PageStatus, default: PageStatus.DRAFT })
  status: PageStatus;

  @Column({ type: 'enum', enum: PageType, default: PageType.CUSTOM })
  type: PageType;

  @Column({ type: 'jsonb', default: [] })
  components: PageComponent[];

  @Column({ nullable: true })
  metaTitle?: string;

  @Column({ nullable: true })
  metaDescription?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  constructor(partial: Partial<Page>) {
    Object.assign(this, partial);
  }
}
