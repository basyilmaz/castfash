import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BatchGenerationJobDto } from './batch-generation-job.dto';

export class BatchGenerateDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchGenerationJobDto)
  jobs: BatchGenerationJobDto[];
}

export interface BatchGenerationJobResult {
  jobIndex: number;
  generationId?: number;
  errors?: {
    front?: string;
    back?: string;
  };
}

export interface BatchGenerateResponse {
  productId: string;
  results: BatchGenerationJobResult[];
}
