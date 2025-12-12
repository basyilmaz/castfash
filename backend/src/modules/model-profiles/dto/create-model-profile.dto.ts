import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateModelProfileDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  bodyType?: string;

  @IsOptional()
  @IsString()
  skinTone?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  faceReferenceUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  backReferenceUrl?: string;

  @IsOptional()
  @IsIn(['IMAGE_REFERENCE', 'TEXT_ONLY', 'HYBRID'])
  modelType?: string;

  @IsOptional()
  @IsString()
  hairColor?: string;

  @IsOptional()
  @IsString()
  hairStyle?: string;

  @IsOptional()
  @IsString()
  ageRange?: string;

  @IsOptional()
  @IsString()
  frontPrompt?: string;

  @IsOptional()
  @IsString()
  backPrompt?: string;

  @IsOptional()
  @IsString()
  stylePrompt?: string;
}
