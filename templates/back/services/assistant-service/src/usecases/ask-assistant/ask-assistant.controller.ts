import { Body, Controller, Post } from '@nestjs/common';
import { AskAssistantDto } from './ask-assistant.dto';
import { AskAssistantUseCase } from './ask-assistant.usecase';

@Controller('assistant')
export class AskAssistantController {
  constructor(private readonly askAssistantUseCase: AskAssistantUseCase) {}

  @Post('ask')
  async ask(@Body() dto: AskAssistantDto) {
    return this.askAssistantUseCase.execute(dto);
  }
}
