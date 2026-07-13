import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Problème de connexion' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "Je n'arrive pas à me connecter à mon compte" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'a1b2c3d4-...' })
  @IsString()
  @IsNotEmpty()
  authorId: string;

  @ApiProperty({ example: 'client@exemple.com' })
  @IsEmail()
  authorEmail: string;
}
