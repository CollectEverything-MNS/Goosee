import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HttpProxyService } from '../../shared/services/http-proxy.service';
import { CreateRoleController } from './usecases/create-role/create-role.controller';
import { ListRolesController } from './usecases/list-roles/list-roles.controller';
import { GetRoleController } from './usecases/get-role/get-role.controller';
import { UpdateRoleController } from './usecases/update-role/update-role.controller';
import { DeleteRoleController } from './usecases/delete-role/delete-role.controller';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [
    CreateRoleController,
    ListRolesController,
    GetRoleController,
    UpdateRoleController,
    DeleteRoleController,
  ],
  providers: [HttpProxyService],
  exports: [],
})
export class RolesModule {}
