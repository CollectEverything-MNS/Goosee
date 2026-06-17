import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Payment } from '../entities/payment.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('PAYMENT_DB_HOST'),
  port: configService.get<number>('PAYMENT_DB_PORT'),
  username: configService.get<string>('PAYMENT_DB_USER'),
  password: configService.get<string>('PAYMENT_DB_PASSWORD'),
  database: configService.get<string>('PAYMENT_DB_NAME'),
  entities: [Payment],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
