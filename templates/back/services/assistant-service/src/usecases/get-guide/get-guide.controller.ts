import { Controller, Get } from '@nestjs/common';
import { KnowledgeBaseService } from '../../shared/knowledge-base.service';

@Controller('assistant')
export class GetGuideController {
  constructor(private readonly knowledgeBase: KnowledgeBaseService) {}

  @Get('guide')
  getGuide() {
    return { content: this.knowledgeBase.getDocument() };
  }
}
