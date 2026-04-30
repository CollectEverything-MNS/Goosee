import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.PRODUCT_DB_HOST,
  port: parseInt(process.env.PRODUCT_DB_PORT, 10),
  username: process.env.PRODUCT_DB_USER,
  password: process.env.PRODUCT_DB_PASSWORD,
  database: process.env.PRODUCT_DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
