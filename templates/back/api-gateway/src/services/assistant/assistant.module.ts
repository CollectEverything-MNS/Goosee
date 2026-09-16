import { Module } from '@nestjs/common';
import { SharedSecurityModule } from '../../shared/shared-security.module';
import { AskAssistantController } from './usecases/ask-assistant/ask-assistant.controller';
import { GetGuideController } from './usecases/get-guide/get-guide.controller';

@Module({
  imports: [SharedSecurityModule],
  controllers: [AskAssistantController, GetGuideController],
  providers: [],
  exports: [],
})
export class AssistantModule {}
