import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnowledgeBaseService } from '../shared/knowledge-base.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    private readonly knowledgeBase: KnowledgeBaseService
  ) {}

  @Get()
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  readiness() {
    const missing: string[] = [];
    if (!this.config.get<string>('GEMINI_API_KEY')) missing.push('GEMINI_API_KEY');
    if (!this.knowledgeBase.getDocument()) missing.push('knowledge');

    if (missing.length) {
      throw new ServiceUnavailableException({ status: 'error', missing });
    }
    return { status: 'ok' };
  }
}
