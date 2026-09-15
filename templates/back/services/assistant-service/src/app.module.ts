import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthController } from './health/health.controller';
import { KnowledgeBaseService } from './shared/knowledge-base.service';
import { ASSISTANT_MODEL } from './shared/assistant-model';
import { GeminiClient } from './shared/gemini.client';
import { AskAssistantController } from './usecases/ask-assistant/ask-assistant.controller';
import { AskAssistantUseCase } from './usecases/ask-assistant/ask-assistant.usecase';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [HealthController, AskAssistantController],
  providers: [
    KnowledgeBaseService,
    {
      provide: ASSISTANT_MODEL,
      useClass: GeminiClient,
    },
    AskAssistantUseCase,
  ],
})
export class AppModule {}
