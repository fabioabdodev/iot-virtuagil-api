import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsClientDocument, IsClientPhone } from '../client-contact.validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @IsClientDocument()
  document?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsClientPhone()
  adminPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @IsClientPhone()
  billingPhone?: string;

  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'delinquent'])
  status?: 'active' | 'inactive' | 'delinquent';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
