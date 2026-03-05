import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class TemperatureDto {
  @IsString()
  device_id: string;

  @Type(() => Number)
  @IsNumber()
  temperature: number;
}