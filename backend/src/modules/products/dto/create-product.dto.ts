import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  productImageUrl?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  productBackImageUrl?: string;
}
