import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
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
  @MaxLength(120)
  adminName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  alertContactName: string;

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
  alertPhone: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  actuationNotifyCooldownMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(86400)
  monitoringIntervalSeconds?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10080)
  offlineAlertDelayMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  deviceApiKey?: string;

  @IsOptional()
  @IsBoolean()
  regenerateDeviceApiKey?: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @IsClientPhone()
  billingPhone: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  billingName?: string;

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
