import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../../entities/log.entity';
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
}
