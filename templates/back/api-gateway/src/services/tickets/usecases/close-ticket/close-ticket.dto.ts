import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CloseTicketDto {
  @ApiProperty({ example: 'Problème résolu, mot de passe réinitialisé.' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
