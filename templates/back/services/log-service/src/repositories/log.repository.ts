import { Log } from '../entities/log.entity';

export abstract class ILogRepository {
  abstract save(log: Log): Promise<Log>;
  abstract list(): Promise<Log[]>;
  abstract deleteByUserId(userId: string): Promise<number>;
}
