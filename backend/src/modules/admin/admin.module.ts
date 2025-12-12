import { Module, forwardRef } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditLogModule } from '../audit/audit-log.module';
import { QueueModule } from '../queue/queue.module';
import { PromptModule } from '../prompt/prompt.module';
import { AiImageModule } from '../../ai-image/ai-image.module';

@Module({
  imports: [
    PrismaModule,
    AuditLogModule,
    PromptModule,
    AiImageModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
