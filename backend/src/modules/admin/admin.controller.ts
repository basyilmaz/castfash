import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/request-user.interface';
import { QueueService } from '../queue/queue.service';
import { PromptService } from '../prompt/prompt.service';

@Controller('system-admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly queueService: QueueService,
    private readonly promptService: PromptService,
  ) { }

  // System Config
  @Get('config')
  async getAllConfigs() {
    return this.adminService.getAllConfigs();
  }

  @Get('config/:key')
  async getConfig(@Param('key') key: string) {
    return this.adminService.getSystemConfig(key);
  }

  @Post('config')
  async setConfig(
    @Body() body: { key: string; value: any; description?: string },
  ) {
    return this.adminService.setSystemConfig(
      body.key,
      body.value,
      body.description,
    );
  }

  // Dashboard Stats
  @Get('stats')
  async getStats() {
    return this.adminService.getSystemStats();
  }

  // User Management
  @Get('users')
  async getUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
    });
  }

  // Organization Management
  @Get('organizations')
  async getOrganizations(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getOrganizations({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
    });
  }

  @Put('organizations/:id/credits')
  async updateCredits(
    @Param('id') id: string,
    @Body() body: { credits: number; note?: string },
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.updateOrganizationCredits(
      parseInt(id),
      body.credits,
      body.note,
      user.userId,
    );
  }

  // Content Management
  @Get('products')
  async getAllProducts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllProducts({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
    });
  }

  @Get('models')
  async getAllModels(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllModels({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      search,
    });
  }

  @Get('generations')
  async getAllGenerations(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllGenerations({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      status,
      search,
    });
  }

  // Service Settings
  @Get('service-settings')
  async getServiceSettings() {
    return this.adminService.getServiceSettings();
  }

  @Put('service-settings')
  async updateServiceSettings(
    @Body() body: { pricing?: any; providers?: any },
  ) {
    return this.adminService.updateServiceSettings(body);
  }

  // AI Providers
  @Get('providers')
  async getProviders() {
    return this.adminService.getProviders();
  }

  @Post('providers')
  async createProvider(@Body() data: any) {
    return this.adminService.createProvider(data);
  }

  @Put('providers/:id')
  async updateProvider(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateProvider(parseInt(id), data);
  }

  @Delete('providers/:id')
  async deleteProvider(@Param('id') id: string) {
    return this.adminService.deleteProvider(parseInt(id));
  }

  @Post('providers/:id/test')
  async testProvider(@Param('id') id: string) {
    return this.adminService.testProvider(parseInt(id));
  }

  @Get('providers/:id/status')
  async getProviderStatus(@Param('id') id: string) {
    return this.adminService.getProviderStatus(parseInt(id));
  }

  @Get('providers/health')
  async getProvidersHealth() {
    return this.adminService.getProvidersHealth();
  }

  @Post('providers/:id/reset-stats')
  async resetProviderStats(@Param('id') id: string) {
    return this.adminService.resetProviderStats(parseInt(id));
  }

  // Reports
  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  @Get('reports/advanced')
  async getAdvancedReports(@Query('days') days?: string) {
    return this.adminService.getAdvancedReports(days ? parseInt(days) : 30);
  }

  // User Detail and Management
  @Get('users/:id')
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(parseInt(id));
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { email?: string; isSuperAdmin?: boolean },
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.updateUser(parseInt(id), body, user.userId);
  }

  @Post('users/:id/reset-password')
  async resetUserPassword(
    @Param('id') id: string,
    @Body() body: { newPassword: string },
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.resetUserPassword(
      parseInt(id),
      body.newPassword,
      user.userId,
    );
  }

  @Post('users/:id/delete')
  async deleteUser(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.adminService.deleteUser(parseInt(id), user.userId);
  }

  // Organization Detail and Management
  @Get('organizations/:id')
  async getOrganizationDetail(@Param('id') id: string) {
    return this.adminService.getOrganizationDetail(parseInt(id));
  }

  @Put('organizations/:id')
  async updateOrganization(
    @Param('id') id: string,
    @Body() body: { name?: string; ownerId?: number },
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.updateOrganization(
      parseInt(id),
      body,
      user.userId,
    );
  }

  @Post('organizations/:id/delete')
  async deleteOrganization(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.adminService.deleteOrganization(parseInt(id), user.userId);
  }

  // Product Detail
  @Get('products/:id')
  async getProductDetail(@Param('id') id: string) {
    return this.adminService.getProductDetail(parseInt(id));
  }

  // Model Detail
  @Get('models/:id')
  async getModelDetail(@Param('id') id: string) {
    return this.adminService.getModelDetail(parseInt(id));
  }

  // Generation Detail
  @Get('generations/:id')
  async getGenerationDetail(@Param('id') id: string) {
    return this.adminService.getGenerationDetail(parseInt(id));
  }

  // Audit Logs
  @Get('audit-logs')
  async getAuditLogs(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('targetType') targetType?: string,
  ) {
    return this.adminService.getAuditLogs({
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
      action: action as any,
      userId: userId ? parseInt(userId) : undefined,
      targetType,
    });
  }

  @Get('audit-logs/stats')
  async getAuditStats() {
    return this.adminService.getAuditStats();
  }

  @Get('audit-logs/recent')
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('audit-logs/target/:targetType/:targetId')
  async getAuditLogsByTarget(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ) {
    return this.adminService.getAuditLogsByTarget(
      targetType,
      parseInt(targetId),
    );
  }

  // Queue Management
  @Get('queue/stats')
  async getQueueStats() {
    return this.queueService.getQueueStats();
  }

  @Get('queue/jobs/:id')
  async getQueueJobStatus(@Param('id') id: string) {
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

  @Post('queue/clear')
  async clearOldQueueJobs() {
    const cleared = this.queueService.clearOldJobs();
    return { cleared, message: `${cleared} eski job temizlendi` };
  }

  // Log Management
  @Get('logs')
  async getLogFiles() {
    return this.adminService.getLogFiles();
  }

  @Get('logs/:filename')
  async getLogContent(
    @Param('filename') filename: string,
    @Query('lines') lines?: string,
  ) {
    return this.adminService.getLogContent(
      filename,
      lines ? parseInt(lines) : 100,
    );
  }

  @Get('logs/live/recent')
  async getRecentLogs(@Query('minutes') minutes?: string) {
    return this.adminService.getRecentLogs(minutes ? parseInt(minutes) : 5);
  }

  // Prompt Template Management
  @Get('prompts/templates')
  async getPromptTemplates(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.promptService.getTemplates({
      type: type as any,
      category: category as any,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('prompts/templates/:id')
  async getPromptTemplate(@Param('id') id: string) {
    return this.promptService.getTemplate(parseInt(id));
  }

  @Post('prompts/templates')
  async createPromptTemplate(
    @Body()
    body: {
      name: string;
      type: string;
      category?: string;
      content: string;
      variables?: any;
      priority?: number;
      tags?: string[];
    },
    @CurrentUser() user: RequestUser,
  ) {
    return this.promptService.createTemplate({
      ...body,
      type: body.type as any,
      category: body.category as any,
      createdBy: user.userId,
    });
  }

  @Put('prompts/templates/:id')
  async updatePromptTemplate(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      content?: string;
      variables?: any;
      isActive?: boolean;
      priority?: number;
      tags?: string[];
    },
    @CurrentUser() user: RequestUser,
  ) {
    return this.promptService.updateTemplate(parseInt(id), {
      ...body,
      createdBy: user.userId,
    });
  }

  @Delete('prompts/templates/:id')
  async deletePromptTemplate(@Param('id') id: string) {
    return this.promptService.deleteTemplate(parseInt(id));
  }

  // Prompt Preset Management
  @Get('prompts/presets')
  async getPromptPresets(@Query('isActive') isActive?: string) {
    return this.promptService.getPresets({
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('prompts/presets/:id')
  async getPromptPreset(@Param('id') id: string) {
    return this.promptService.getPreset(parseInt(id));
  }

  @Post('prompts/presets')
  async createPromptPreset(
    @Body()
    body: {
      name: string;
      description?: string;
      scenePrompt?: string;
      posePrompt?: string;
      lightingPrompt?: string;
      stylePrompt?: string;
      negativePrompt?: string;
      tags?: string[];
    },
    @CurrentUser() user: RequestUser,
  ) {
    return this.promptService.createPreset({
      ...body,
      createdBy: user.userId,
    });
  }

  @Put('prompts/presets/:id')
  async updatePromptPreset(@Param('id') id: string, @Body() body: any) {
    return this.promptService.updatePreset(parseInt(id), body);
  }

  @Delete('prompts/presets/:id')
  async deletePromptPreset(@Param('id') id: string) {
    return this.promptService.deletePreset(parseInt(id));
  }
}
