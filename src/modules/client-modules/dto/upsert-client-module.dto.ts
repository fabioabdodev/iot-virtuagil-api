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
  @IsIn(['ambiental', 'acionamento', 'energia'])
  moduleKey: 'ambiental' | 'acionamento' | 'energia';

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{3,50}$/)
  itemKey?: string;

  @IsBoolean()
  enabled: boolean;
}
