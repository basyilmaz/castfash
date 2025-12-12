import { Module } from '@nestjs/common';
import { AiProviderConfigService } from './ai-provider-config.service';
import { AiProviderConfigController } from './ai-provider-config.controller';

@Module({
  controllers: [AiProviderConfigController],
  providers: [AiProviderConfigService],
})
export class AiProviderConfigModule {}
