import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CATEGORIE_PREUVE_RGPD, Log } from '../../entities/log.entity';
import { ILogRepository } from '../log.repository';

@Injectable()
export class TypeOrmLogRepository implements ILogRepository {
  constructor(
    @InjectRepository(Log)
    private readonly repository: Repository<Log>
  ) {}

  async save(log: Log): Promise<Log> {
    return this.repository.save(log);
  }

  async list(): Promise<Log[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  // Le `IS NULL` n'est pas decoratif : en SQL, `NULL <> 'rgpd-preuve'` vaut NULL
  // et non true. Un `delete({ userId, categorie: Not(...) })` laisserait donc en
  // place toutes les traces metier, qui portent une categorie nulle — la purge
  // cesserait de purger, en silence.
  async deleteByUserId(userId: string): Promise<number> {
    const res = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Log)
      .where('"userId" = :userId', { userId })
      .andWhere('("categorie" IS NULL OR "categorie" <> :preuve)', {
        preuve: CATEGORIE_PREUVE_RGPD,
      })
      .execute();
    return res.affected ?? 0;
  }
}
