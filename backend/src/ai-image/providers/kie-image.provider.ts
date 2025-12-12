import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AiProviderType } from '@prisma/client';
import { AiImageGenerateOptions, AiImageProvider } from '../ai-image.types';
import { PrismaService } from '../../prisma/prisma.service';

interface KieTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

interface KieRecordInfoResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state: 'waiting' | 'success' | 'fail';
    param: string;
    resultJson: string | null;
    failCode: string | null;
    failMsg: string | null;
    costTime: number | null;
    completeTime: number | null;
    createTime: number;
  };
}

interface KieResultJson {
  resultUrls?: string[];
  resultObject?: Record<string, any>;
}

@Injectable()
export class KieImageProvider implements AiImageProvider {
  private readonly logger = new Logger(KieImageProvider.name);
  private readonly envApiKey = process.env.KIE_API_KEY;
  private readonly envModelId = process.env.KIE_MODEL_ID ?? 'google/nano-banana-pro';

  // KIE API endpoints
  private readonly CREATE_TASK_URL = 'https://api.kie.ai/api/v1/jobs/createTask';
  private readonly RECORD_INFO_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo';

  // Polling settings
  private readonly MAX_POLL_ATTEMPTS = 60; // Max 60 attempts
  private readonly POLL_INTERVAL_MS = 2000; // 2 seconds between polls

  constructor(private readonly prisma: PrismaService) { }

  private async getConfigForOrg(organizationId?: number) {
    if (organizationId) {
      const orgCfg = await this.prisma.aiProviderConfig.findFirst({
        where: { organizationId, provider: AiProviderType.KIE, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (orgCfg) return orgCfg;
    }

    const globalCfg = await this.prisma.aiProviderConfig.findFirst({
      where: {
        organizationId: null,
        provider: AiProviderType.KIE,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (globalCfg) return globalCfg;

    // fallback to env
    return {
      apiKey: this.envApiKey,
      modelId: this.envModelId,
      settings: undefined,
    };
  }

  getProviderType(): AiProviderType {
    return AiProviderType.KIE;
  }

  /**
   * Create a generation task
   */
  private async createTask(
    apiKey: string,
    modelId: string,
    prompt: string,
    negativePrompt: string | undefined,
    imageInputs: string[],
    aspectRatio: string,
    resolution: string,
    outputFormat: string,
  ): Promise<string> {
    const payload = {
      model: modelId,
      input: {
        prompt,
        negative_prompt: negativePrompt || 'ugly, disfigured, blurry, low quality, extra limbs, bad anatomy',
        image_urls: imageInputs || [],
        aspect_ratio: aspectRatio,
        resolution: resolution,
        output_format: outputFormat,
      },
    };

    this.logger.debug(`KIE createTask payload: model=${payload.model}, prompt_len=${prompt.length}, image_urls_count=${imageInputs.length}`);
    this.logger.debug(`KIE image_urls: ${JSON.stringify(imageInputs)}`);

    const response = await axios.post<KieTaskResponse>(
      this.CREATE_TASK_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000,
      },
    );

    if (response.data.code !== 200) {
      throw new Error(`KIE createTask failed: ${response.data.msg}`);
    }

    const taskId = response.data.data.taskId;
    this.logger.log(`KIE task created: ${taskId}`);
    return taskId;
  }

  /**
   * Poll for task completion
   */
  private async pollTaskResult(apiKey: string, taskId: string): Promise<string> {
    for (let attempt = 0; attempt < this.MAX_POLL_ATTEMPTS; attempt++) {
      const response = await axios.get<KieRecordInfoResponse>(
        `${this.RECORD_INFO_URL}?taskId=${taskId}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 10000,
        },
      );

      if (response.data.code !== 200) {
        throw new Error(`KIE recordInfo failed: ${response.data.msg}`);
      }

      const { state, resultJson, failMsg, failCode } = response.data.data;

      if (state === 'success') {
        if (!resultJson) {
          throw new Error('KIE task succeeded but resultJson is empty');
        }

        const result: KieResultJson = JSON.parse(resultJson);
        const imageUrl = result.resultUrls?.[0];

        if (!imageUrl) {
          throw new Error('KIE resultJson has no resultUrls');
        }

        this.logger.log(`KIE task ${taskId} completed successfully`);
        return imageUrl;
      }

      if (state === 'fail') {
        throw new Error(`KIE task failed: ${failCode} - ${failMsg}`);
      }

      // state === 'waiting', continue polling
      this.logger.debug(`KIE task ${taskId} still waiting (attempt ${attempt + 1}/${this.MAX_POLL_ATTEMPTS})`);
      await this.sleep(this.POLL_INTERVAL_MS);
    }

    throw new Error(`KIE task ${taskId} timed out after ${this.MAX_POLL_ATTEMPTS} attempts`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generateImage(
    options: AiImageGenerateOptions,
    organizationId?: number,
  ): Promise<string> {
    const startedAt = Date.now();
    const config = await this.getConfigForOrg(organizationId);
    const apiKey = config?.apiKey ?? this.envApiKey;
    const modelId = config?.modelId ?? this.envModelId;

    if (!apiKey) {
      throw new Error('KIE API not configured (missing apiKey)');
    }

    const {
      prompt,
      negativePrompt,
      aspectRatio = '9:16',
      resolution = '1K',
      imageInputs = [],
    } = options;

    // Map resolution to KIE format
    let kieResolution = '1K';
    if (resolution === '4K' || resolution === '2K') {
      kieResolution = resolution;
    }

    // Map aspect ratio - remove any format differences
    const kieAspectRatio = aspectRatio.replace(':', ':');

    this.logger.log(
      `KIE generation start org=${organizationId ?? 'global'} aspect=${kieAspectRatio} res=${kieResolution} model=${modelId}`,
    );

    try {
      // Step 1: Create task
      const taskId = await this.createTask(
        apiKey,
        modelId,
        prompt,
        negativePrompt,
        imageInputs,
        kieAspectRatio,
        kieResolution,
        'png',
      );

      // Step 2: Poll for result
      const imageUrl = await this.pollTaskResult(apiKey, taskId);

      const duration = Date.now() - startedAt;
      this.logger.log(
        `KIE generation succeeded in ${duration}ms url=${String(imageUrl).slice(0, 120)}`,
      );

      return imageUrl;
    } catch (err: any) {
      const duration = Date.now() - startedAt;
      const status = err?.response?.status;
      const body = err?.response?.data
        ? JSON.stringify(err.response.data).slice(0, 400)
        : err.message;
      this.logger.error(
        `KIE generation failed in ${duration}ms status=${status} err=${body}`,
      );
      throw err;
    }
  }
}
