import { Inject, Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { GetUserController } from './usecases/get-user/get-user.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ClientsModule.registerAsync([
            {
                name: 'USER_SERVICE',
                useFactory: (config: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: config.get<string>('USER_SERVICE_HOST', 'user-service'),
                        port: config.get<number>('USER_SERVICE_PORT', 3003),
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [GetUserController],
})
export class UserModule implements OnModuleInit {
    private readonly logger = new Logger(UserModule.name);

    constructor(@Inject('USER_SERVICE') private readonly userService: ClientProxy) {}

    async onModuleInit() {
        try {
            await this.userService.connect();
            this.logger.log('✅ Successfully connected to User Service via TCP');
        } catch (error) {
            this.logger.error('❌ Failed to connect to User Service:', error.message);
        }
    }
}
