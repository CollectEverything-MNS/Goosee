import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {UserModule} from "./services/user/user.module";
import { OrderModule } from './services/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    OrderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
