import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ViewType } from '@prisma/client';

export class GenerateProductImageDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsEnum(ViewType)
  @IsNotEmpty()
  view: ViewType;
}
