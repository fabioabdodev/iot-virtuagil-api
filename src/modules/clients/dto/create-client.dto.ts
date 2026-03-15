import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { IsClientDocument, IsClientPhone } from '../client-contact.validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]{3,50}$/)
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @IsClientDocument()
  document: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @IsClientPhone()
  adminPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @IsClientPhone()
  billingPhone: string;

  @IsEmail()
  billingEmail: string;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive', 'delinquent'])
  status?: 'active' | 'inactive' | 'delinquent';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
