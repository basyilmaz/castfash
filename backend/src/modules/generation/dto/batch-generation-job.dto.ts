import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class BatchGenerationJobDto {
  @IsString()
  @IsNotEmpty()
  modelProfileId: string;

  @IsString()
  @IsNotEmpty()
  sceneId: string;

  @IsInt()
  @Min(0)
  frontCount: number;

  @IsInt()
  @Min(0)
  backCount: number;

  @IsString()
  @IsNotEmpty()
  aspectRatio: string;

  @IsString()
  @IsNotEmpty()
  resolution: string;

  @IsString()
  @IsNotEmpty()
  quality: string;
}
