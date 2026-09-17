import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { IRoleRepository } from '../repositories/role.repository';
import { Role } from '../entities/role.entity';

const ALL_PAGE_KEYS = [
  'dashboard',
  'analytics',
  'users',
  'roles',
  'logs',
  'clients',
  'return-clients',
  'products',
  'stock',
  'tickets',
  'categories',
  'orders',
  'sales-history',
  'pages',
  'menu',
  'settings',
  'templates',
  'rgpd',
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
      if (existing.isSystem) {
        const current = existing.pageKeys ?? [];
        const same =
          current.length === pageKeys.length &&
          current.every((k) => pageKeys.includes(k));
        if (!same) {
          existing.pageKeys = pageKeys;
          await this.roleRepo.save(existing);
          this.logger.log(`Role ${name} page keys synchronized`);
        } else {
          this.logger.log(`Role ${name} already present, skipping seed`);
        }
      } else {
        this.logger.log(`Role ${name} already present, skipping seed`);
      }
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
