import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Log } from '../entities/log.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('LOG_DB_HOST'),
  port: configService.get<number>('LOG_DB_PORT'),
  username: configService.get<string>('LOG_DB_USER'),
  password: configService.get<string>('LOG_DB_PASSWORD'),
  database: configService.get<string>('LOG_DB_NAME'),
  entities: [Log],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
