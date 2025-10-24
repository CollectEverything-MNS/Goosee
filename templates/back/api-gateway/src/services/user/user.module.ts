import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { GetUserController } from './usecases/get-user/get-user.controller';
import { GetUserService } from './usecases/get-user/get-user.service';

@Module({
    imports: [
        ConfigModule,
        HttpModule,
    ],
    controllers: [
        GetUserController,
    ],
    providers: [
        GetUserService,
    ],
    exports: [
        GetUserService,
    ],
})
export class UserModule {}
