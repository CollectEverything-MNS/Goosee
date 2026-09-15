import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { AskAssistantController } from './usecases/ask-assistant/ask-assistant.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [AskAssistantController],
  providers: [],
  exports: [],
})
export class AssistantModule {}
