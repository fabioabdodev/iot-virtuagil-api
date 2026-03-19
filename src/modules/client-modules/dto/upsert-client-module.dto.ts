import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpsertClientModuleDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,50}$/)
  clientId: string;

  @IsString()
  @IsIn(['ambiental', 'acionamento', 'energia', 'temperature', 'actuation'])
  moduleKey: 'ambiental' | 'acionamento' | 'energia' | 'temperature' | 'actuation';

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{3,50}$/)
  itemKey?: string;

  @IsBoolean()
  enabled: boolean;
}
