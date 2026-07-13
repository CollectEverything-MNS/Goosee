import { IsNotEmpty, IsString } from 'class-validator';

export class CloseTicketDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}
