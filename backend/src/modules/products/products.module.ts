import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AiImageModule } from '../../ai-image/ai-image.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AiImageModule, CreditsModule],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
