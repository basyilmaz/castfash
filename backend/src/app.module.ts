import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProductsModule } from './modules/products/products.module';
import { ModelProfilesModule } from './modules/model-profiles/model-profiles.module';
import { ScenesModule } from './modules/scenes/scenes.module';
import { GenerationModule } from './modules/generation/generation.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { AiImageModule } from './ai-image/ai-image.module';
import { AiProviderConfigModule } from './ai-provider-config/ai-provider-config.module';
import { UploadModule } from './upload/upload.module';
import { StatsModule } from './modules/stats/stats.module';
import { ScenePackModule } from './modules/scene-pack/scene-pack.module';
import { CreditsModule } from './modules/credits/credits.module';
import { HealthModule } from './health/health.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { validateEnv } from './config/env.validation';
import { AdminModule } from './modules/admin/admin.module';
import { EmailModule } from './modules/email/email.module';
import { QueueModule } from './modules/queue/queue.module';
import { LoggerModule } from './common/logger/logger.module';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { BatchModule } from './modules/batch/batch.module';
import { InvoiceModule } from './modules/billing/invoice.module';
import { ProductVariantModule } from './modules/product-variant/product-variant.module';
import { PaymentModule } from './modules/payment/payment.module';
import { CacheModule } from './common/cache';
import { ImageModule } from './common/image';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    // Rate limiting with multiple tiers
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second (burst protection)
      },
      {
        name: 'medium',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    CacheModule, // Global cache service (memory/Redis)
    ImageModule, // Global image processing service (Sharp)
    LoggerModule, // Global logger module
    EmailModule, // Global module - must be before AuthModule
    HealthModule,
    AuthModule,
    OrganizationsModule,
    ProductsModule,
    ModelProfilesModule,
    ScenesModule,
    GenerationModule,
    SeederModule,
    AiImageModule,
    AiProviderConfigModule,
    UploadModule,
    StatsModule,
    ScenePackModule,
    CreditsModule,
    AdminModule,
    QueueModule, // Async generation queue
    BatchModule,
    InvoiceModule,
    ProductVariantModule,
    PaymentModule, // Stripe payment integration
  ],
  providers: [
    // Apply throttler guard globally
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // Apply logging interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
