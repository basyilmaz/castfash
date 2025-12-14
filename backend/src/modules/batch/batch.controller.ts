import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BatchService, CreateBatchJobDto } from './batch.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BatchJobStatus, BatchJobType } from '@prisma/client';

@Controller('batch')
@UseGuards(JwtAuthGuard)
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  // ---------------------------------------------------------------------------
  // Create Batch Job
  // ---------------------------------------------------------------------------

  @Post()
  async createBatchJob(@Request() req: any, @Body() dto: CreateBatchJobDto) {
    const organizationId = req.user.organizationId;
    const userId = req.user.userId;
    return this.batchService.createBatchJob(organizationId, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // Get Batch Job
  // ---------------------------------------------------------------------------

  @Get(':id')
  async getBatchJob(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const organizationId = req.user.organizationId;
    return this.batchService.getBatchJob(id, organizationId);
  }

  // ---------------------------------------------------------------------------
  // List Batch Jobs
  // ---------------------------------------------------------------------------

  @Get()
  async listBatchJobs(
    @Request() req: any,
    @Query('status') status?: BatchJobStatus,
    @Query('type') type?: BatchJobType,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const organizationId = req.user.organizationId;
    return this.batchService.listBatchJobs(organizationId, {
      status,
      type,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  // ---------------------------------------------------------------------------
  // Get Job Progress
  // ---------------------------------------------------------------------------

  @Get(':id/progress')
  async getJobProgress(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.getJobProgress(id);
  }

  // ---------------------------------------------------------------------------
  // Start Processing
  // ---------------------------------------------------------------------------

  @Put(':id/start')
  async startProcessing(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.startProcessing(id);
  }

  // ---------------------------------------------------------------------------
  // Cancel Job
  // ---------------------------------------------------------------------------

  @Put(':id/cancel')
  async cancelJob(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const organizationId = req.user.organizationId;
    return this.batchService.cancelJob(id, organizationId);
  }

  // ---------------------------------------------------------------------------
  // Retry Failed Items
  // ---------------------------------------------------------------------------

  @Put(':id/retry')
  async retryFailedItems(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.retryFailedItems(id);
  }

  // ---------------------------------------------------------------------------
  // Delete Job
  // ---------------------------------------------------------------------------

  @Delete(':id')
  async deleteJob(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    const organizationId = req.user.organizationId;
    return this.batchService.deleteJob(id, organizationId);
  }
}
