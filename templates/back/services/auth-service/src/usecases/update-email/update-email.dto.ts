import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsString()
  authId: string;

  @IsOptional()
  @IsEmail()
  newEmail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  role?: string[];
}
