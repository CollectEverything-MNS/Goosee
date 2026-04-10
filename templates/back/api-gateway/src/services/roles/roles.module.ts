import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { CreateRoleController } from './usecases/create-role/create-role.controller';
import { ListRolesController } from './usecases/list-roles/list-roles.controller';
import { GetRoleController } from './usecases/get-role/get-role.controller';
import { UpdateRoleController } from './usecases/update-role/update-role.controller';
import { DeleteRoleController } from './usecases/delete-role/delete-role.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [
    CreateRoleController,
    ListRolesController,
    GetRoleController,
    UpdateRoleController,
    DeleteRoleController,
  ],
  providers: [],
  exports: [],
})
export class RolesModule {}

