import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('ORDER_DB_HOST'),
  port: configService.get<number>('ORDER_DB_PORT'),
  username: configService.get<string>('ORDER_DB_USER'),
  password: configService.get<string>('ORDER_DB_PASSWORD'),
  database: configService.get<string>('ORDER_DB_NAME'),
  entities: [Order],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
