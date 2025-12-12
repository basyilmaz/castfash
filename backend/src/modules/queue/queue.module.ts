import { Module, forwardRef } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AiImageModule } from '../../ai-image/ai-image.module';

@Module({
  imports: [forwardRef(() => AiImageModule)],
  controllers: [QueueController],
  providers: [QueueService, PrismaService],
  exports: [QueueService],
})
export class QueueModule {}
