import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { IssueSessionUseCase } from './issue-session.usecase';
import { InternalTokenGuard } from '../../shared/internal-token.guard';

class IssueSessionDto {
  @IsEmail()
  email: string;
}

// Endpoint interne : émet une session pour un e-mail (SSO). Protégé par le jeton interne et
// non exposé publiquement (seule la gateway du tenant l'appelle, sur le réseau interne).
@Controller('internal')
@UseGuards(InternalTokenGuard)
export class IssueSessionController {
  constructor(private readonly issueSession: IssueSessionUseCase) {}

  @Post('issue-session')
  async issue(@Body() dto: IssueSessionDto) {
    return this.issueSession.execute(dto.email);
  }
}
