import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { InternalTokenGuard } from '../shared/internal-token.guard';

// Statuts qui comptent comme chiffre d'affaires réel (commande honorée).
const REVENUE_STATUSES = ['paid', 'prepared', 'shipped'];

@Controller('internal/kpi')
@UseGuards(InternalTokenGuard)
export class InternalKpiController {
  constructor(@InjectRepository(Order) private readonly orders: Repository<Order>) {}

  @Get()
  async kpi() {
    const [orders, paidOrders, revenue] = await Promise.all([
      this.orders.count(),
      this.orders.count({ where: { status: In(REVENUE_STATUSES) } }),
      this.orders
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalCents), 0)', 'sum')
        .where('order.status IN (:...statuses)', { statuses: REVENUE_STATUSES })
        .getRawOne<{ sum: string }>(),
    ]);

    return {
      orders,
      paidOrders,
      revenueCents: Number(revenue?.sum ?? 0),
    };
  }
}
