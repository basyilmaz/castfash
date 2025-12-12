import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiImageService } from '../../ai-image/ai-image.service';
import { buildPrompts } from '../../generation/prompt-builder';
import { GenerationStatus, ViewType } from '@prisma/client';

export interface GenerationJob {
  id: string;
  generationRequestId: number;
  organizationId: number;
  productId: number;
  modelProfileId?: number;
  scenePresetId?: number;
  prompt: string;
  aspectRatio: string;
  resolution: string;
  qualityMode: string;
  imageInputs: string[];
  viewType: ViewType;
  indexNumber: number;
  createdAt: Date;
  retryCount: number;
}

export interface JobResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  processingTimeMs: number;
}

interface QueueItem {
  job: GenerationJob;
  addedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private queue: Map<string, QueueItem> = new Map();
  private isProcessing = false;
  private concurrency = 3; // Process up to 3 jobs concurrently
  private activeJobs = 0;
  private maxRetries = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiImageService: AiImageService,
  ) {}

  onModuleInit() {
    this.logger.log('Queue service initialized');
    this.startProcessing();
  }

  /**
   * Add a generation job to the queue
   */
  async addJob(job: GenerationJob): Promise<string> {
    const jobId =
      job.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    this.queue.set(jobId, {
      job: { ...job, id: jobId },
      addedAt: new Date(),
      status: 'pending',
    });

    this.logger.log(
      `Job ${jobId} added to queue. Queue size: ${this.queue.size}`,
    );

    // Trigger processing if not already running
    this.processNext();

    return jobId;
  }

  /**
   * Add multiple generation jobs for a request
   */
  async addGenerationRequest(
    generationRequestId: number,
    organizationId: number,
    productId: number,
    dto: {
      modelProfileId?: number;
      scenePresetId?: number;
      frontCount: number;
      backCount: number;
      aspectRatio: string;
      resolution: string;
      qualityMode: string;
    },
  ): Promise<string[]> {
    const jobIds: string[] = [];

    // Fetch required data
    const [product, modelProfile, scenePreset] = await Promise.all([
      this.prisma.product.findUnique({ where: { id: productId } }),
      dto.modelProfileId
        ? this.prisma.modelProfile.findUnique({
            where: { id: dto.modelProfileId },
          })
        : null,
      dto.scenePresetId
        ? this.prisma.scenePreset.findUnique({
            where: { id: dto.scenePresetId },
          })
        : null,
    ]);

    if (!product) {
      throw new Error('Product not found');
    }

    // Build prompts
    const prompts = buildPrompts(product, modelProfile, scenePreset);

    // Create front view jobs
    for (let i = 0; i < dto.frontCount; i++) {
      const imageInputs = [
        product.productImageUrl,
        modelProfile?.faceReferenceUrl,
        scenePreset?.backgroundReferenceUrl,
      ].filter(Boolean) as string[];

      const jobId = await this.addJob({
        id: `gen_${generationRequestId}_front_${i}`,
        generationRequestId,
        organizationId,
        productId,
        modelProfileId: dto.modelProfileId,
        scenePresetId: dto.scenePresetId,
        prompt: prompts.front?.fullPrompt || '',
        aspectRatio: dto.aspectRatio,
        resolution: dto.resolution,
        qualityMode: dto.qualityMode,
        imageInputs,
        viewType: ViewType.FRONT,
        indexNumber: i,
        createdAt: new Date(),
        retryCount: 0,
      });
      jobIds.push(jobId);
    }

    // Create back view jobs
    for (let i = 0; i < dto.backCount; i++) {
      const imageInputs = [
        product.productBackImageUrl || product.productImageUrl,
        modelProfile?.backReferenceUrl || modelProfile?.faceReferenceUrl,
        scenePreset?.backgroundReferenceUrl,
      ].filter(Boolean) as string[];

      const jobId = await this.addJob({
        id: `gen_${generationRequestId}_back_${i}`,
        generationRequestId,
        organizationId,
        productId,
        modelProfileId: dto.modelProfileId,
        scenePresetId: dto.scenePresetId,
        prompt: prompts.back?.fullPrompt || prompts.front?.fullPrompt || '',
        aspectRatio: dto.aspectRatio,
        resolution: dto.resolution,
        qualityMode: dto.qualityMode,
        imageInputs,
        viewType: ViewType.BACK,
        indexNumber: i,
        createdAt: new Date(),
        retryCount: 0,
      });
      jobIds.push(jobId);
    }

    this.logger.log(
      `Added ${jobIds.length} jobs for generation request ${generationRequestId}`,
    );

    return jobIds;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): QueueItem | null {
    return this.queue.get(jobId) || null;
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    this.queue.forEach((item) => {
      switch (item.status) {
        case 'pending':
          pending++;
          break;
        case 'processing':
          processing++;
          break;
        case 'completed':
          completed++;
          break;
        case 'failed':
          failed++;
          break;
      }
    });

    return {
      total: this.queue.size,
      pending,
      processing,
      completed,
      failed,
      concurrency: this.concurrency,
      activeJobs: this.activeJobs,
    };
  }

  /**
   * Start the processing loop
   */
  private startProcessing() {
    setInterval(() => {
      this.processNext();
    }, 1000); // Check every second
  }

  /**
   * Process next available job
   */
  private async processNext() {
    if (this.activeJobs >= this.concurrency) {
      return; // Already at max concurrency
    }

    // Find next pending job
    let nextJob: QueueItem | null = null;
    for (const item of this.queue.values()) {
      if (item.status === 'pending') {
        nextJob = item;
        break;
      }
    }

    if (!nextJob) {
      return; // No pending jobs
    }

    // Mark as processing
    nextJob.status = 'processing';
    this.activeJobs++;

    try {
      await this.processJob(nextJob.job);
      nextJob.status = 'completed';
    } catch (error: any) {
      this.logger.error(`Job ${nextJob.job.id} failed: ${error.message}`);

      // Retry logic
      if (nextJob.job.retryCount < this.maxRetries) {
        nextJob.job.retryCount++;
        nextJob.status = 'pending';
        this.logger.log(
          `Retrying job ${nextJob.job.id} (attempt ${nextJob.job.retryCount}/${this.maxRetries})`,
        );
      } else {
        nextJob.status = 'failed';
        await this.handleJobFailure(nextJob.job, error.message);
      }
    } finally {
      this.activeJobs--;
      this.processNext(); // Try to process next job
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: GenerationJob): Promise<void> {
    const startTime = Date.now();
    this.logger.log(
      `Processing job ${job.id} for generation request ${job.generationRequestId}`,
    );

    try {
      // Generate image
      const imageUrl = await this.aiImageService.generateForOrganization(
        job.organizationId,
        {
          prompt: job.prompt,
          aspectRatio: job.aspectRatio,
          resolution: job.resolution,
          imageInputs: job.imageInputs,
          qualityMode: job.qualityMode as 'FAST' | 'STANDARD' | 'HIGH',
        },
      );

      const processingTimeMs = Date.now() - startTime;

      // Save generated image
      await this.prisma.generatedImage.create({
        data: {
          generationRequestId: job.generationRequestId,
          productId: job.productId,
          viewType: job.viewType,
          indexNumber: job.indexNumber,
          imageUrl,
        },
      });

      // Check if all jobs for this request are complete
      await this.checkRequestCompletion(job.generationRequestId);

      this.logger.log(`Job ${job.id} completed in ${processingTimeMs}ms`);
    } catch (error: any) {
      const processingTimeMs = Date.now() - startTime;
      this.logger.error(
        `Job ${job.id} failed after ${processingTimeMs}ms: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Check if all jobs for a generation request are complete
   */
  private async checkRequestCompletion(generationRequestId: number) {
    const request = await this.prisma.generationRequest.findUnique({
      where: { id: generationRequestId },
      include: {
        generatedImages: true,
      },
    });

    if (!request) return;

    const totalExpected = request.frontCount + request.backCount;
    const totalGenerated = request.generatedImages.length;

    // Check for pending/processing jobs
    let hasPendingJobs = false;
    for (const item of this.queue.values()) {
      if (
        item.job.generationRequestId === generationRequestId &&
        (item.status === 'pending' || item.status === 'processing')
      ) {
        hasPendingJobs = true;
        break;
      }
    }

    if (!hasPendingJobs) {
      // All jobs completed
      const hasErrors = totalGenerated < totalExpected;
      await this.prisma.generationRequest.update({
        where: { id: generationRequestId },
        data: {
          status: hasErrors ? GenerationStatus.ERROR : GenerationStatus.DONE,
          errorMessage: hasErrors
            ? `${totalGenerated}/${totalExpected} images generated`
            : null,
        },
      });

      this.logger.log(
        `Generation request ${generationRequestId} completed: ${totalGenerated}/${totalExpected} images`,
      );
    }
  }

  /**
   * Handle job failure
   */
  private async handleJobFailure(job: GenerationJob, errorMessage: string) {
    // Update generation request with error
    const request = await this.prisma.generationRequest.findUnique({
      where: { id: job.generationRequestId },
    });

    if (request) {
      const errorField =
        job.viewType === ViewType.FRONT ? 'frontError' : 'backError';
      await this.prisma.generationRequest.update({
        where: { id: job.generationRequestId },
        data: {
          [errorField]: errorMessage,
        },
      });
    }

    await this.checkRequestCompletion(job.generationRequestId);
  }

  /**
   * Clear completed and failed jobs older than specified time
   */
  clearOldJobs(maxAgeMs: number = 3600000) {
    const cutoff = Date.now() - maxAgeMs;
    let cleared = 0;

    for (const [id, item] of this.queue.entries()) {
      if (
        (item.status === 'completed' || item.status === 'failed') &&
        item.addedAt.getTime() < cutoff
      ) {
        this.queue.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.logger.log(`Cleared ${cleared} old jobs from queue`);
    }

    return cleared;
  }
}
