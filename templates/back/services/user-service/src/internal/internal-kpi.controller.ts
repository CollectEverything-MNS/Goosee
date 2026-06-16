import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InternalTokenGuard } from '../shared/internal-token.guard';

@Controller('internal/kpi')
@UseGuards(InternalTokenGuard)
export class InternalKpiController {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  @Get()
  async kpi() {
    const users = await this.users.count();
    const customers = await this.users
      .createQueryBuilder('u')
      .where(':role = ANY(u.role)', { role: 'CUSTOMER' })
      .getCount();
    const admins = await this.users
      .createQueryBuilder('u')
      .where(':role = ANY(u.role)', { role: 'OWNER' })
      .getCount();
    return { users, customers, admins };
  }
}
