import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTicketDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsString()
  @IsNotEmpty()
  assignedTo: string;
}
