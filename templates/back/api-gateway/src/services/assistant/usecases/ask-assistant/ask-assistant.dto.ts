import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ enum: ['user', 'assistant'] })
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @ApiProperty({ maxLength: 4000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content: string;
}

export class AskAssistantDto {
  @ApiProperty({ example: 'Comment ajouter un produit au catalogue ?', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  question: string;

  @ApiPropertyOptional({
    type: [ChatMessageDto],
    description: 'Derniers echanges (10 max) pour garder le contexte',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}
