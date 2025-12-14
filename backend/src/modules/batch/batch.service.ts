import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchJobStatus, BatchJobType, Prisma } from '@prisma/client';

// =============================================================================
// DTOs
// =============================================================================

export interface CreateBatchJobDto {
  type: BatchJobType;
  name?: string;
  description?: string;
  settings?: Prisma.JsonValue;
  inputData?: Prisma.JsonValue;
  items?: Array<{ inputData?: Prisma.JsonValue }>;
}

export interface BatchJobProgressDto {
  id: number;
  status: BatchJobStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  progress: number;
  startedAt: Date | null;
  completedAt: Date | null;
}

// =============================================================================
// Service
// =============================================================================

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Create Batch Job
  // ---------------------------------------------------------------------------

  async createBatchJob(
    organizationId: number,
    dto: CreateBatchJobDto,
    createdBy?: number,
  ) {
    const totalItems = dto.items?.length || 0;

    const batchJob = await this.prisma.batchJob.create({
      data: {
        organizationId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        settings: dto.settings || {},
        inputData: dto.inputData || {},
        totalItems,
        createdBy,
        items: dto.items
          ? {
              create: dto.items.map((item, index) => ({
                itemIndex: index,
                inputData: item.inputData || {},
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    this.logger.log(
      `Created batch job ${batchJob.id} with ${totalItems} items`,
    );
    return batchJob;
  }

  // ---------------------------------------------------------------------------
  // Get Batch Job
  // ---------------------------------------------------------------------------

  async getBatchJob(id: number, organizationId?: number) {
    const where: Prisma.BatchJobWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const batchJob = await this.prisma.batchJob.findFirst({
      where,
      include: {
        items: {
          orderBy: { itemIndex: 'asc' },
        },
      },
    });

    if (!batchJob) {
      throw new NotFoundException(`Batch job ${id} not found`);
    }

    return batchJob;
  }

  // ---------------------------------------------------------------------------
  // List Batch Jobs
  // ---------------------------------------------------------------------------

  async listBatchJobs(
    organizationId: number,
    options: {
      status?: BatchJobStatus;
      type?: BatchJobType;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { status, type, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.BatchJobWhereInput = { organizationId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [jobs, total] = await Promise.all([
      this.prisma.batchJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } },
        },
      }),
      this.prisma.batchJob.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Get Job Progress
  // ---------------------------------------------------------------------------

  async getJobProgress(id: number): Promise<BatchJobProgressDto> {
    const job = await this.prisma.batchJob.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        totalItems: true,
        processedItems: true,
        failedItems: true,
        startedAt: true,
        completedAt: true,
      },
    });

    if (!job) {
      throw new NotFoundException(`Batch job ${id} not found`);
    }

    const progress =
      job.totalItems > 0
        ? Math.round((job.processedItems / job.totalItems) * 100)
        : 0;

    return { ...job, progress };
  }

  // ---------------------------------------------------------------------------
  // Start Processing
  // ---------------------------------------------------------------------------

  async startProcessing(id: number) {
    const job = await this.prisma.batchJob.update({
      where: { id },
      data: {
        status: BatchJobStatus.PROCESSING,
        startedAt: new Date(),
      },
    });

    this.logger.log(`Started processing batch job ${id}`);
    return job;
  }

  // ---------------------------------------------------------------------------
  // Process Item
  // ---------------------------------------------------------------------------

  async processItem(
    batchJobId: number,
    itemIndex: number,
    result: {
      success: boolean;
      outputData?: Prisma.JsonValue;
      error?: string;
    },
  ) {
    const item = await this.prisma.batchJobItem.updateMany({
      where: { batchJobId, itemIndex },
      data: {
        status: result.success
          ? BatchJobStatus.COMPLETED
          : BatchJobStatus.FAILED,
        outputData: result.outputData || {},
        errorMessage: result.error,
        processedAt: new Date(),
      },
    });

    // Update main job progress
    await this.prisma.batchJob.update({
      where: { id: batchJobId },
      data: {
        processedItems: { increment: 1 },
        ...(result.success ? {} : { failedItems: { increment: 1 } }),
      },
    });

    return item;
  }

  // ---------------------------------------------------------------------------
  // Complete Job
  // ---------------------------------------------------------------------------

  async completeJob(id: number, outputData?: Prisma.JsonValue) {
    const job = await this.prisma.batchJob.update({
      where: { id },
      data: {
        status: BatchJobStatus.COMPLETED,
        completedAt: new Date(),
        outputData: outputData || {},
      },
    });

    this.logger.log(`Completed batch job ${id}`);
    return job;
  }

  // ---------------------------------------------------------------------------
  // Fail Job
  // ---------------------------------------------------------------------------

  async failJob(id: number, error: string, details?: Prisma.JsonValue) {
    const job = await this.prisma.batchJob.update({
      where: { id },
      data: {
        status: BatchJobStatus.FAILED,
        completedAt: new Date(),
        errorMessage: error,
        errorDetails: details || {},
      },
    });

    this.logger.error(`Failed batch job ${id}: ${error}`);
    return job;
  }

  // ---------------------------------------------------------------------------
  // Cancel Job
  // ---------------------------------------------------------------------------

  async cancelJob(id: number, organizationId?: number) {
    const where: Prisma.BatchJobWhereInput = {
      id,
      status: { in: [BatchJobStatus.PENDING, BatchJobStatus.PROCESSING] },
    };
    if (organizationId) where.organizationId = organizationId;

    const job = await this.prisma.batchJob.findFirst({ where });
    if (!job) {
      throw new NotFoundException(`Active batch job ${id} not found`);
    }

    const updated = await this.prisma.batchJob.update({
      where: { id },
      data: {
        status: BatchJobStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    this.logger.log(`Cancelled batch job ${id}`);
    return updated;
  }

  // ---------------------------------------------------------------------------
  // Retry Failed Items
  // ---------------------------------------------------------------------------

  async retryFailedItems(id: number) {
    const result = await this.prisma.batchJobItem.updateMany({
      where: {
        batchJobId: id,
        status: BatchJobStatus.FAILED,
      },
      data: {
        status: BatchJobStatus.PENDING,
        errorMessage: null,
        processedAt: null,
      },
    });

    // Reset job counters
    if (result.count > 0) {
      await this.prisma.batchJob.update({
        where: { id },
        data: {
          status: BatchJobStatus.PROCESSING,
          processedItems: { decrement: result.count },
          failedItems: 0,
          completedAt: null,
        },
      });
    }

    this.logger.log(`Retrying ${result.count} failed items in batch job ${id}`);
    return result;
  }

  // ---------------------------------------------------------------------------
  // Delete Job
  // ---------------------------------------------------------------------------

  async deleteJob(id: number, organizationId?: number) {
    const where: Prisma.BatchJobWhereInput = { id };
    if (organizationId) where.organizationId = organizationId;

    const job = await this.prisma.batchJob.findFirst({ where });
    if (!job) {
      throw new NotFoundException(`Batch job ${id} not found`);
    }

    await this.prisma.batchJob.delete({ where: { id } });
    this.logger.log(`Deleted batch job ${id}`);
    return { success: true };
  }
}
