import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Cart } from '../entities/cart.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('CART_DB_HOST'),
  port: configService.get<number>('CART_DB_PORT'),
  username: configService.get<string>('CART_DB_USER'),
  password: configService.get<string>('CART_DB_PASSWORD'),
  database: configService.get<string>('CART_DB_NAME'),
  entities: [Cart],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
