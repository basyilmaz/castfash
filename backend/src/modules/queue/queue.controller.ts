import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

@Controller('queue')
@UseGuards(JwtAuthGuard)
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  /**
   * Get queue statistics (admin only)
   */
  @Get('stats')
  @UseGuards(SuperAdminGuard)
  getStats() {
    return this.queueService.getQueueStats();
  }

  /**
   * Get job status
   */
  @Get('jobs/:id')
  getJobStatus(@Param('id') id: string) {
    const job = this.queueService.getJobStatus(id);
    if (!job) {
      return { found: false, id };
    }
    return {
      found: true,
      id,
      status: job.status,
      addedAt: job.addedAt,
      job: {
        generationRequestId: job.job.generationRequestId,
        viewType: job.job.viewType,
        indexNumber: job.job.indexNumber,
        retryCount: job.job.retryCount,
      },
    };
  }

  /**
   * Clear old completed/failed jobs (admin only)
   */
  @Post('clear')
  @UseGuards(SuperAdminGuard)
  clearOldJobs() {
    const cleared = this.queueService.clearOldJobs();
    return { cleared };
  }
}
