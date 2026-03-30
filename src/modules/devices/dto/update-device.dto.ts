import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsNotEmpty,
  Matches,
  Max,
  MinLength,
  Min,
} from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]{3,50}$/)
  clientId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minTemperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxTemperature?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(10)
  @Max(86400)
  monitoringIntervalSeconds?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(10080)
  offlineAlertDelayMinutes?: number;
}
