import { Inject, Injectable } from '@nestjs/common';
import { ASSISTANT_MODEL, AssistantModel, ChatMessage } from '../../shared/assistant-model';
import { KnowledgeBaseService } from '../../shared/knowledge-base.service';
import { AskAssistantDto } from './ask-assistant.dto';

const MAX_HISTORY = 10;

export interface AskAssistantResult {
  answer: string;
  model: string;
}

@Injectable()
export class AskAssistantUseCase {
  constructor(
    @Inject(ASSISTANT_MODEL) private readonly model: AssistantModel,
    private readonly knowledgeBase: KnowledgeBaseService,
  ) {}

  async execute(payload: AskAssistantDto): Promise<AskAssistantResult> {
    const history: ChatMessage[] = (payload.history ?? [])
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.trim() }))
      .filter((m) => m.content.length > 0);

    const messages: ChatMessage[] = [...history, { role: 'user', content: payload.question.trim() }];

    const answer = await this.model.generate(this.knowledgeBase.buildSystemPrompt(), messages);

    return { answer, model: this.model.name };
  }
}
