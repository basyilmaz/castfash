import { IsInt, IsOptional, IsString } from 'class-validator';

export class AdjustCreditsDto {
  @IsInt()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;
}
