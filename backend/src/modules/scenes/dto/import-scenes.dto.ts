import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ImportSceneItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  backgroundReferenceUrl?: string;

  @IsOptional()
  @IsString()
  backgroundPrompt?: string;

  @IsOptional()
  @IsString()
  lighting?: string;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  suggestedAspectRatio?: string;

  @IsOptional()
  @IsString()
  qualityPreset?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tags?: string;
}

export class ImportScenesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportSceneItemDto)
  scenes: ImportSceneItemDto[];
}
