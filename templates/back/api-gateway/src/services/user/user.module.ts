import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { CreateUserController } from './usecases/create-user/create-user.controller';
import { GetUserController } from './usecases/get-user/get-user.controller';
import { ListUsersController } from './usecases/list-users/list-users.controller';
import { UpdateUserController } from './usecases/update-user/update-user.controller';
import { DeleteUserController } from './usecases/delete-user/delete-user.controller';
import { ListCustomersController } from './usecases/list-customers/list-customers.controller';
import { ListAdminsController } from './usecases/list-admins/list-admins.controller';


@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [
    CreateUserController,
    GetUserController,
    ListUsersController,
    UpdateUserController,
    DeleteUserController,
    ListCustomersController,
    ListAdminsController,
  ],
  providers: [
    HttpProxyService,
  ],
  exports: [],
})
export class UserModule {}
