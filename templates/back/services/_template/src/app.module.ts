import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InMemoryUserRepository } from './repositories/implements/user.impl.repository';
import { IUserRepository } from './repositories/user.repository';
import { GetUserController } from "./usecases/get-user/get-user.controller";
import { GetUserUseCase } from "./usecases/get-user/get-user.usecase";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [GetUserController],
  providers: [
    {
      provide: IUserRepository,
      useClass: InMemoryUserRepository,
    },
      GetUserUseCase
  ],
})
export class AppModule {}
