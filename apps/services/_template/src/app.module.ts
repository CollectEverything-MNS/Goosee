import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreateUserUseCase } from './applications/usecases/create-user.usecase';
import { IUserRepository } from './domain/repositories/user.repository';
import { CreateUserController } from './infrastructures/controllers/create-user.controller';
import { InMemoryUserRepository } from './infrastructures/persistence/user.impl.repository';

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
