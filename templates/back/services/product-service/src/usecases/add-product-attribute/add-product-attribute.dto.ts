import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class AddProductAttributeDto {
  @ApiProperty({ example: 'millésime' })
  @IsString()
  @Length(1, 100)
  key: string;

  @ApiProperty({ example: '2019' })
  @IsString()
  @Length(1, 255)
  value: string;
}
