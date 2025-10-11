import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './applications/usecases/create-user.usecase';
import { CreateUserController } from './infrastructures/controllers/create-user.controller';
import { InMemoryUserRepository } from './infrastructures/persistence/in-memory-user.repository';

@Module({
  controllers: [CreateUserController],
  providers: [
    {
      provide: 'UserRepository',
      useClass: InMemoryUserRepository,
    },
    CreateUserUseCase,
  ],
})
export class AppModule {}
