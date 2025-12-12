# 🛡️ AI Provider Fallback Chain & Resilience Plan

**Tarih:** 28 Kasım 2025  
**Kapsam:** KIE → Replicate → FAL Fallback Sistemi

---

## 🎯 **PROVIDER HIERARCHY**

```
┌─────────────────────────────────────────┐
│         PRIMARY: KIE                    │
│  (Nano Banana Lite/Flash/Pro)           │
│  Priority: 1                            │
│  Usage: 80-90%                          │
└─────────────────────────────────────────┘
              ↓ (Hata durumunda)
┌─────────────────────────────────────────┐
│       SECONDARY: Replicate              │
│  (FLUX, SDXL)                           │
│  Priority: 2                            │
│  Usage: 5-10%                           │
└─────────────────────────────────────────┘
              ↓ (Hata durumunda)
┌─────────────────────────────────────────┐
│        TERTIARY: FAL                    │
│  (FLUX Schnell/Dev)                     │
│  Priority: 3                            │
│  Usage: 5%                              │
└─────────────────────────────────────────┘
              ↓ (Hata durumunda)
┌─────────────────────────────────────────┐
│         FALLBACK: Placeholder           │
│  (Picsum veya hata görseli)             │
│  Priority: 4                            │
└─────────────────────────────────────────┘
```

---

## 📋 **DATABASE SCHEMA GÜNCELLEMESİ**

### **AiProviderConfig Tablosu:**
```prisma
model AiProviderConfig {
  id             Int       @id @default(autoincrement())
  organizationId Int?
  provider       AiProviderType
  apiKey         String
  baseUrl        String?
  modelId        String?
  isActive       Boolean   @default(true)
  settings       Json?
  
  // YENİ ALANLAR:
  priority       Int       @default(1)        // 1=Primary, 2=Secondary, 3=Tertiary
  maxRetries     Int       @default(3)        // Kaç kez deneme
  timeoutMs      Int       @default(30000)    // Timeout süresi
  lastError      String?                      // Son hata mesajı
  lastErrorAt    DateTime?                    // Son hata zamanı
  errorCount     Int       @default(0)        // Hata sayacı
  successCount   Int       @default(0)        // Başarı sayacı
  avgResponseMs  Int?                         // Ortalama yanıt süresi
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

### **Migration:**
```sql
-- Add new columns
ALTER TABLE "AiProviderConfig" 
  ADD COLUMN "priority" INTEGER DEFAULT 1,
  ADD COLUMN "maxRetries" INTEGER DEFAULT 3,
  ADD COLUMN "timeoutMs" INTEGER DEFAULT 30000,
  ADD COLUMN "lastError" TEXT,
  ADD COLUMN "lastErrorAt" TIMESTAMP,
  ADD COLUMN "errorCount" INTEGER DEFAULT 0,
  ADD COLUMN "successCount" INTEGER DEFAULT 0,
  ADD COLUMN "avgResponseMs" INTEGER;

-- Set priorities for existing providers
UPDATE "AiProviderConfig" SET "priority" = 1 WHERE "provider" = 'KIE';
UPDATE "AiProviderConfig" SET "priority" = 2 WHERE "provider" = 'REPLICATE';
UPDATE "AiProviderConfig" SET "priority" = 3 WHERE "provider" = 'FAL';
```

---

## 🔧 **BACKEND IMPLEMENTATION**

### **1. Provider Selection Service**

```typescript
// backend/src/ai-image/provider-selector.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiProviderType } from '@prisma/client';

interface ProviderHealth {
  provider: AiProviderType;
  isHealthy: boolean;
  errorRate: number;
  avgResponseTime: number;
  lastError?: string;
}

@Injectable()
export class ProviderSelectorService {
  private readonly logger = new Logger(ProviderSelectorService.name);
  private healthCache = new Map<string, ProviderHealth>();
  private readonly HEALTH_CHECK_INTERVAL = 60000; // 1 minute

  constructor(private prisma: PrismaService) {
    this.startHealthMonitoring();
  }

  /**
   * Select best available provider based on priority and health
   */
  async selectProvider(organizationId?: number): Promise<AiProviderConfig | null> {
    // Get all active providers sorted by priority
    const providers = await this.prisma.aiProviderConfig.findMany({
      where: {
        OR: [
          { organizationId },
          { organizationId: null }
        ],
        isActive: true
      },
      orderBy: [
        { priority: 'asc' },
        { errorCount: 'asc' },
        { avgResponseMs: 'asc' }
      ]
    });

    if (providers.length === 0) {
      this.logger.error('No active providers found');
      return null;
    }

    // Try each provider in order
    for (const provider of providers) {
      const health = await this.checkProviderHealth(provider);
      
      if (health.isHealthy) {
        this.logger.log(`Selected provider: ${provider.provider} (priority: ${provider.priority})`);
        return provider;
      }
      
      this.logger.warn(
        `Provider ${provider.provider} is unhealthy (error rate: ${health.errorRate}%), trying next...`
      );
    }

    this.logger.error('All providers are unhealthy');
    return providers[0]; // Return primary even if unhealthy (will fail gracefully)
  }

  /**
   * Check provider health based on recent errors
   */
  private async checkProviderHealth(provider: AiProviderConfig): Promise<ProviderHealth> {
    const cacheKey = `${provider.id}`;
    const cached = this.healthCache.get(cacheKey);
    
    if (cached && Date.now() - cached.lastCheck < this.HEALTH_CHECK_INTERVAL) {
      return cached;
    }

    const totalCalls = provider.successCount + provider.errorCount;
    const errorRate = totalCalls > 0 
      ? (provider.errorCount / totalCalls) * 100 
      : 0;

    // Consider unhealthy if:
    // - Error rate > 50% in last 100 calls
    // - Last error was < 5 minutes ago and error count > 5
    const recentErrorThreshold = 5 * 60 * 1000; // 5 minutes
    const isRecentError = provider.lastErrorAt && 
      (Date.now() - provider.lastErrorAt.getTime()) < recentErrorThreshold;

    const isHealthy = 
      errorRate < 50 && 
      !(isRecentError && provider.errorCount > 5);

    const health: ProviderHealth = {
      provider: provider.provider,
      isHealthy,
      errorRate,
      avgResponseTime: provider.avgResponseMs || 0,
      lastError: provider.lastError || undefined,
      lastCheck: Date.now()
    };

    this.healthCache.set(cacheKey, health);
    return health;
  }

  /**
   * Record successful generation
   */
  async recordSuccess(providerId: number, responseTimeMs: number) {
    const provider = await this.prisma.aiProviderConfig.findUnique({
      where: { id: providerId }
    });

    if (!provider) return;

    const newAvg = provider.avgResponseMs
      ? Math.round((provider.avgResponseMs + responseTimeMs) / 2)
      : responseTimeMs;

    await this.prisma.aiProviderConfig.update({
      where: { id: providerId },
      data: {
        successCount: { increment: 1 },
        errorCount: Math.max(0, provider.errorCount - 1), // Decrease error count on success
        avgResponseMs: newAvg
      }
    });

    this.logger.log(`Provider ${provider.provider} success recorded (${responseTimeMs}ms)`);
  }

  /**
   * Record failed generation
   */
  async recordError(providerId: number, error: string) {
    await this.prisma.aiProviderConfig.update({
      where: { id: providerId },
      data: {
        errorCount: { increment: 1 },
        lastError: error.slice(0, 500), // Limit error message length
        lastErrorAt: new Date()
      }
    });

    this.logger.error(`Provider error recorded: ${error}`);
  }

  /**
   * Start background health monitoring
   */
  private startHealthMonitoring() {
    setInterval(async () => {
      try {
        const providers = await this.prisma.aiProviderConfig.findMany({
          where: { isActive: true }
        });

        for (const provider of providers) {
          await this.checkProviderHealth(provider);
        }
      } catch (error) {
        this.logger.error('Health monitoring error:', error);
      }
    }, this.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Reset error counts (can be called periodically or manually)
   */
  async resetErrorCounts() {
    await this.prisma.aiProviderConfig.updateMany({
      data: {
        errorCount: 0,
        lastError: null,
        lastErrorAt: null
      }
    });

    this.logger.log('All provider error counts reset');
  }
}
```

---

### **2. Updated AI Image Service**

```typescript
// backend/src/ai-image/ai-image.service.ts

@Injectable()
export class AiImageService {
  private readonly logger = new Logger(AiImageService.name);
  private providers: Map<AiProviderType, AiImageProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerSelector: ProviderSelectorService,
    kieProvider: KieImageProvider,
    replicateProvider: ReplicateImageProvider,
    falProvider: FalImageProvider,
  ) {
    this.providers = new Map([
      [AiProviderType.KIE, kieProvider],
      [AiProviderType.REPLICATE, replicateProvider],
      [AiProviderType.FAL, falProvider],
    ]);
  }

  /**
   * Generate image with automatic fallback
   */
  async generateForOrganization(
    organizationId: number,
    options: AiImageGenerateOptions,
  ): Promise<string> {
    const maxAttempts = 3; // Try up to 3 different providers
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Select best available provider
        const config = await this.providerSelector.selectProvider(organizationId);
        
        if (!config) {
          throw new Error('AI görsel üretimi için yapılandırma bulunamadı.');
        }

        const provider = this.providers.get(config.provider);
        
        if (!provider) {
          throw new Error(`Provider ${config.provider} not implemented`);
        }

        this.logger.log(
          `Attempt ${attempt + 1}: Using provider ${config.provider} (priority: ${config.priority})`
        );

        const startTime = Date.now();
        
        // Generate image
        const imageUrl = await provider.generateImage(options, organizationId);
        
        const responseTime = Date.now() - startTime;

        // Record success
        await this.providerSelector.recordSuccess(config.id, responseTime);

        this.logger.log(
          `Generation successful with ${config.provider} in ${responseTime}ms`
        );

        return imageUrl;

      } catch (error: any) {
        lastError = error;
        
        this.logger.error(
          `Attempt ${attempt + 1} failed: ${error.message}`
        );

        // Record error if we have a config
        const config = await this.providerSelector.selectProvider(organizationId);
        if (config) {
          await this.providerSelector.recordError(config.id, error.message);
        }

        // If this was the last attempt, throw
        if (attempt === maxAttempts - 1) {
          break;
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // All attempts failed
    this.logger.error(
      `All ${maxAttempts} provider attempts failed. Last error: ${lastError?.message}`
    );

    throw new Error(
      `Görsel üretilemedi. Tüm AI servisleri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.`
    );
  }
}
```

---

## 🎨 **FRONTEND UPDATES**

### **Provider Management UI:**

```tsx
// Add priority field to provider form
<AppInput
  label="Öncelik (1=Primary, 2=Secondary, 3=Tertiary)"
  type="number"
  min="1"
  max="3"
  value={newProvider.priority}
  onChange={(e) => setNewProvider({ 
    ...newProvider, 
    priority: parseInt(e.target.value) 
  })}
/>

// Show health status
<div className="grid grid-cols-3 gap-4">
  <div>
    <p className="text-xs text-textMuted">Success Rate</p>
    <p className="text-sm font-medium">
      {((provider.successCount / (provider.successCount + provider.errorCount)) * 100).toFixed(1)}%
    </p>
  </div>
  <div>
    <p className="text-xs text-textMuted">Avg Response</p>
    <p className="text-sm font-medium">{provider.avgResponseMs}ms</p>
  </div>
  <div>
    <p className="text-xs text-textMuted">Error Count</p>
    <p className="text-sm font-medium text-red-400">{provider.errorCount}</p>
  </div>
</div>
```

---

## 📊 **MONITORING & ALERTS**

### **Health Dashboard:**

```typescript
// GET /system-admin/providers/health
{
  providers: [
    {
      provider: "KIE",
      priority: 1,
      isActive: true,
      isHealthy: true,
      successRate: 98.5,
      avgResponseTime: 2500,
      errorCount: 3,
      lastError: null,
      status: "HEALTHY"
    },
    {
      provider: "REPLICATE",
      priority: 2,
      isActive: true,
      isHealthy: true,
      successRate: 95.0,
      avgResponseTime: 4500,
      errorCount: 12,
      lastError: "Rate limit exceeded",
      status: "DEGRADED"
    }
  ],
  overallHealth: "HEALTHY"
}
```

---

## 🚨 **ERROR HANDLING SCENARIOS**

### **Scenario 1: KIE Down**
```
1. Request comes in
2. Try KIE → Fails (timeout/error)
3. Record error for KIE
4. Auto-select Replicate (priority 2)
5. Try Replicate → Success
6. Return result
7. Alert admin: "KIE is down, using Replicate"
```

### **Scenario 2: All Providers Down**
```
1. Try KIE → Fail
2. Try Replicate → Fail
3. Try FAL → Fail
4. Return placeholder image
5. Alert admin: "ALL PROVIDERS DOWN"
6. Log to error tracking
```

### **Scenario 3: Rate Limit**
```
1. Try KIE → Rate limit error
2. Mark KIE as temporarily unhealthy
3. Auto-switch to Replicate
4. After 5 minutes, reset KIE health
5. Resume using KIE
```

---

## ⚙️ **CONFIGURATION**

### **Environment Variables:**
```env
# Provider Fallback Settings
AI_FALLBACK_ENABLED=true
AI_MAX_RETRY_ATTEMPTS=3
AI_RETRY_BACKOFF_MS=1000
AI_HEALTH_CHECK_INTERVAL_MS=60000
AI_ERROR_THRESHOLD_PERCENT=50
AI_CIRCUIT_BREAKER_TIMEOUT_MS=300000  # 5 minutes

# Provider Timeouts
KIE_TIMEOUT_MS=30000
REPLICATE_TIMEOUT_MS=45000
FAL_TIMEOUT_MS=20000
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Database & Core Logic** (2-3 hours)
- [ ] Add new columns to AiProviderConfig
- [ ] Create migration
- [ ] Implement ProviderSelectorService
- [ ] Update AiImageService with fallback logic
- [ ] Add health monitoring

### **Phase 2: Frontend Updates** (1-2 hours)
- [ ] Add priority field to provider form
- [ ] Show health metrics on provider cards
- [ ] Add health dashboard page
- [ ] Add manual reset button

### **Phase 3: Testing** (1 hour)
- [ ] Test KIE failure → Replicate fallback
- [ ] Test all providers down scenario
- [ ] Test health monitoring
- [ ] Test error recovery

### **Phase 4: Monitoring** (1 hour)
- [ ] Add logging
- [ ] Add metrics
- [ ] Add alerts
- [ ] Create dashboard

---

## 🎯 **SUCCESS CRITERIA**

- [ ] KIE failure automatically falls back to Replicate
- [ ] Replicate failure automatically falls back to FAL
- [ ] Health monitoring detects unhealthy providers
- [ ] Error counts reset after successful calls
- [ ] Admin can see provider health in real-time
- [ ] System never completely fails (placeholder fallback)
- [ ] Response time < 5s even with fallback

---

## 💰 **COST IMPACT**

### **Normal Operation (KIE only):**
```
1000 generations × $0.03 = $30/day
```

### **With Fallback (10% Replicate):**
```
900 KIE × $0.03 = $27
100 Replicate × $0.055 = $5.50
TOTAL: $32.50/day (+8%)
```

### **Acceptable Trade-off:**
```
+8% cost for 99.9% uptime ✅
```

---

**Uygulayalım mı?** 🚀
