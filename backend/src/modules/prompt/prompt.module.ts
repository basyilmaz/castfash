import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
