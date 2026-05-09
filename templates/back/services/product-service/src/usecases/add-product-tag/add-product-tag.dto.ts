import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddProductTagDto {
  @ApiProperty({ example: 'uuid-du-tag' })
  @IsUUID()
  tagId: string;
}
