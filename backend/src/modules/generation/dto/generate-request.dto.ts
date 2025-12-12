import { IsIn, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

export class GenerateRequestDto {
  @IsInt()
  @Min(0)
  @Max(10)
  frontCount: number;

  @IsInt()
  @Min(0)
  @Max(10)
  backCount: number;

  @IsInt()
  modelProfileId: number;

  @IsInt()
  scenePresetId: number;

  @IsOptional()
  @IsIn(['9:16', '16:9'])
  aspectRatio?: '9:16' | '16:9';

  @IsOptional()
  @IsIn(['1K', '2K', '4K'])
  resolution?: '1K' | '2K' | '4K';

  @IsOptional()
  @IsIn(['FAST', 'STANDARD', 'HIGH'])
  qualityMode?: 'FAST' | 'STANDARD' | 'HIGH';

  @IsOptional()
  customPromptFront?: string;

  @IsOptional()
  customPromptBack?: string;

  @IsOptional()
  @IsString()
  cameraAngle?: string;

  @IsOptional()
  @IsString()
  shotType?: string;

  @IsOptional()
  @IsString()
  modelPose?: string;

  @IsOptional()
  @IsString()
  overridePromptFront?: string;

  @IsOptional()
  @IsString()
  overridePromptBack?: string;
}
