import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GetUserController } from './usecases/get-user/get-user.controller';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.TCP,
                options: {
                    host: process.env.USER_SERVICE_HOST || 'user-service',
                    port: Number(process.env.USER_SERVICE_TCP_PORT) || 3004,
                },
            },
        ]),
    ],
    controllers: [GetUserController],
})
export class UserModule {}
