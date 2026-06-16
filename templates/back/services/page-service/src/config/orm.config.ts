import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Page } from '../entities/page.entity';
import { Menu } from '../entities/menu.entity';
import { SiteSettings } from '../entities/site-settings.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('PAGE_DB_HOST'),
  port: configService.get<number>('PAGE_DB_PORT'),
  username: configService.get<string>('PAGE_DB_USER'),
  password: configService.get<string>('PAGE_DB_PASSWORD'),
  database: configService.get<string>('PAGE_DB_NAME'),
  entities: [Page, Menu, SiteSettings],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
