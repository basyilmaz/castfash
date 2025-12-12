import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { SceneType } from '@prisma/client';

export class CreateSceneDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(SceneType)
  type?: SceneType;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  backgroundReferenceUrl?: string;

  @IsOptional()
  @IsString()
  solidColorHex?: string;

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
