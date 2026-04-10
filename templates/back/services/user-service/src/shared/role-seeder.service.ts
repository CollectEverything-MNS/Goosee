import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { IRoleRepository } from '../repositories/role.repository';
import { Role } from '../entities/role.entity';

const ALL_PAGE_KEYS = [
  'dashboard',
  'users',
  'roles',
  'clients',
  'return-clients',
  'products',
  'categories',
  'orders',
  'sales-history',
  'pages',
  'menu',
  'settings',
  'templates',
];

@Injectable()
export class RoleSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoleSeederService.name);

  constructor(private readonly roleRepo: IRoleRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedRole('OWNER', 'Owner with full access', ALL_PAGE_KEYS);
    await this.seedRole('CUSTOMER', 'End user with no back-office access', []);
  }

  private async seedRole(
    name: string,
    description: string,
    pageKeys: string[],
  ): Promise<void> {
    const existing = await this.roleRepo.findByName(name);
    if (existing) {
      this.logger.log(`Role ${name} already present, skipping seed`);
      return;
    }

    const role = new Role();
    role.name = name;
    role.description = description;
    role.isSystem = true;
    role.pageKeys = pageKeys;

    await this.roleRepo.save(role);
    this.logger.log(`Role ${name} seeded`);
  }
}
