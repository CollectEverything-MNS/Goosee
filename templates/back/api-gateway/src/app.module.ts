import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { HttpMetricsInterceptor } from './metrics/http-metrics.interceptor';
import { InternalModule } from './internal/internal.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './services/auth/auth.module';
import { UserModule } from './services/user/user.module';
import { PagesModule } from './services/pages/pages.module';
import { UploadModule } from './services/upload/upload.module';
import { RolesModule } from './services/roles/roles.module';
import { SharedSecurityModule } from './shared/shared-security.module';
import { CategoriesModule } from './services/categories/categories.module';
import { ProductsModule } from './services/products/products.module';
import { OrdersModule } from './services/orders/orders.module';
import { CartModule } from './services/cart/cart.module';
import { PaymentsModule } from './services/payments/payments.module';
import { TagsModule } from './services/tags/tags.module';
import { LogsModule } from './services/logs/logs.module';
import { TicketsModule } from './services/tickets/tickets.module';
import { StockModule } from './services/stock/stock.module';
import { RgpdModule } from './services/rgpd/rgpd.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    SharedSecurityModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PagesModule,
    UploadModule,
    RolesModule,
    ProductsModule,
    OrdersModule,
    CartModule,
    PaymentsModule,
    CategoriesModule,
    TagsModule,
    LogsModule,
    InternalModule,
    TicketsModule,
    StockModule,
    RgpdModule,
  ],
  controllers: [HealthController, MetricsController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor }],
})
export class AppModule {}
