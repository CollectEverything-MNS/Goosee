import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum TicketStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, example: TicketStatus.IN_PROGRESS })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
