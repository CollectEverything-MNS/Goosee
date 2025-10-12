import { ConfigService } from '@nestjs/config';
import { User } from 'src/domain/entities/user.entity';
import { DataSource } from 'typeorm';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: configService.get<string>('NODE_ENV') === 'test',
});
