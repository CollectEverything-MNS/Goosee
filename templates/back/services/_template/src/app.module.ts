import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InMemoryUserRepository } from './repositories/user.impl.repository';
import { IUserRepository } from './repositories/user.repository';
import { CreateUserController } from './usecases/create-user/create-user.controller';
import { CreateUserUseCase } from './usecases/create-user/create-user.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [CreateUserController],
  providers: [
    {
      provide: IUserRepository,
      useClass: InMemoryUserRepository,
    },
    CreateUserUseCase,
  ],
})
export class AppModule {}
