import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { InternalKpiController } from './internal/internal-kpi.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

import { IUserRepository } from './repositories/user.repository';
import { TypeOrmUserRepository } from './repositories/implements/user.impl.repository';
import { IRoleRepository } from './repositories/role.repository';
import { TypeOrmRoleRepository } from './repositories/implements/role.impl.repository';
import { RoleSeederService } from './shared/role-seeder.service';

import { CreateUserController } from './usecases/create-user/create-user.controller';
import { DeleteUserController } from './usecases/delete-user/delete-user.controller';
import { GetUserController } from './usecases/get-user/get-user.controller';
import { ListUsersController } from './usecases/list-users/list-users.controller';

import { CreateUserUseCase } from './usecases/create-user/create-user.usecase';
import { DeleteUserUseCase } from './usecases/delete-user/delete-user.usecase';
import { GetUserUseCase } from './usecases/get-user/get-user.usecase';
import { ListUsersUsecase } from './usecases/list-users/list-users.usecase';
import { ListCustomersController } from './usecases/list-customers/list-customers.controller';
import { ListAdminsController } from './usecases/list-admins/list-admins.controller';
import { UpdateUserController } from './usecases/update-user/update-user.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateUserEventsListener } from './usecases/create-user/create-user.event';
import { UpdateUserUseCase } from './usecases/update-user/update-user.usecase';
import { ListCustomersUseCase } from './usecases/list-customers/list-customers.usecase';
import { ListAdminsUseCase } from './usecases/list-admins/list-admins.usecase';
import { LogClient } from './shared/log-client.service';

import { CreateRoleController } from './usecases/create-role/create-role.controller';
import { CreateRoleUseCase } from './usecases/create-role/create-role.usecase';
import { ListRolesController } from './usecases/list-roles/list-roles.controller';
import { ListRolesUseCase } from './usecases/list-roles/list-roles.usecase';
import { GetRoleController } from './usecases/get-role/get-role.controller';
import { GetRoleUseCase } from './usecases/get-role/get-role.usecase';
import { UpdateRoleController } from './usecases/update-role/update-role.controller';
import { UpdateRoleUseCase } from './usecases/update-role/update-role.usecase';
import { DeleteRoleController } from './usecases/delete-role/delete-role.controller';
import { DeleteRoleUseCase } from './usecases/delete-role/delete-role.usecase';
import { GetUserByAuthController } from './usecases/get-user-by-auth/get-user-by-auth.controller';
import { GetUserByAuthUseCase } from './usecases/get-user-by-auth/get-user-by-auth.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('USER_DB_HOST'),
        port: configService.get<number>('USER_DB_PORT'),
        username: configService.get<string>('USER_DB_USER'),
        password: configService.get<string>('USER_DB_PASSWORD'),
        database: configService.get<string>('USER_DB_NAME'),
        entities: [User, Role],
        migrations: ['dist/migrations/*.js'],
        migrationsRun: configService.get<string>('NODE_ENV') !== 'development',
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    TypeOrmModule.forFeature([User, Role]),

    ClientsModule.registerAsync([
      {
        name: 'RMQ_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'user_events',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'LOG_CLIENT',
        inject: [ConfigService],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [cfg.get<string>('RABBITMQ_URL')!],
            queue: 'log_events',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],

  controllers: [
    HealthController,
    MetricsController,
    InternalKpiController,
    CreateUserController,
    ListCustomersController,
    ListAdminsController,
    CreateUserEventsListener,
    GetUserController,
    ListUsersController,
    UpdateUserController,
    DeleteUserController,
    CreateRoleController,
    ListRolesController,
    GetRoleController,
    UpdateRoleController,
    DeleteRoleController,
    GetUserByAuthController,
  ],

  providers: [
    {
      provide: IUserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: IRoleRepository,
      useClass: TypeOrmRoleRepository,
    },
    RoleSeederService,

    CreateUserUseCase,
    GetUserUseCase,
    ListUsersUsecase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ListCustomersUseCase,
    ListAdminsUseCase,
    LogClient,
    CreateRoleUseCase,
    ListRolesUseCase,
    GetRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    GetUserByAuthUseCase,
  ],
})
export class AppModule {}
