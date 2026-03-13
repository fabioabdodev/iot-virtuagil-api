import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,50}$/)
  clientId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'operator'])
  role?: 'admin' | 'operator';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
