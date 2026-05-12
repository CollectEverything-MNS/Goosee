import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Bio' })
  @IsString()
  @Length(2, 50)
  name: string;
}
