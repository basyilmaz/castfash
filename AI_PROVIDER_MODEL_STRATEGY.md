# 🎯 AI Provider & Model Selection Strategy

**Tarih:** 28 Kasım 2025  
**Kapsam:** Provider Fallback + Model Mapping + Use Case Strategy

---

## 📊 **PROVIDER & MODEL MATRİSİ**

### **Quality Mode → Provider → Model Mapping:**

```
FAST Mode:
├─ PRIMARY: KIE → nano-banana-lite
├─ FALLBACK: FAL → flux-schnell
└─ LAST: Replicate → sdxl-turbo

STANDARD Mode:
├─ PRIMARY: KIE → nano-banana-flash
├─ FALLBACK: Replicate → flux-dev
└─ LAST: FAL → flux-dev

HIGH Mode:
├─ PRIMARY: KIE → nano-banana-pro
├─ FALLBACK: Replicate → flux-pro
└─ LAST: FAL → flux-pro
```

---

## 🎨 **USE CASE BAZLI STRATEJI**

### **1. MODEL PROFILE GENERATION**

#### **A. Face/Back Reference - Final (Production)**
```yaml
Use Case: Model referans görseli (müşteriye sunulacak)
Quality Mode: HIGH
Cost: 5-8 token

Provider Chain:
  1. KIE nano-banana-pro
     - Hyper-realistic
     - Physics-aware
     - Best quality
     Cost: 5-8 token
     
  2. Replicate flux-pro (fallback)
     - Professional quality
     - Slower but reliable
     Cost: 6-10 token
     
  3. FAL flux-pro (last resort)
     - Good quality
     - Fast
     Cost: 4-6 token

Parameters:
  - Resolution: 2K or 4K
  - Aspect Ratio: 3:4 (portrait)
  - Output Format: WEBP
  - Prompt: Full (base + attributes + style + master)
```

#### **B. Face/Back Reference - Preview (Testing)**
```yaml
Use Case: Kullanıcı test ediyor, hızlı önizleme
Quality Mode: FAST
Cost: 1 token

Provider Chain:
  1. KIE nano-banana-lite
     - Fast generation
     - Acceptable quality for preview
     Cost: 1 token
     
  2. FAL flux-schnell (fallback)
     - Very fast
     - Good for preview
     Cost: 0.5 token
     
  3. Replicate sdxl-turbo (last resort)
     - Fast
     - Lower quality
     Cost: 0.3 token

Parameters:
  - Resolution: 1K
  - Aspect Ratio: 3:4
  - Output Format: WEBP
  - Prompt: Simplified (base + key attributes)
```

---

### **2. PRODUCT ON MODEL GENERATION**

#### **A. Final Catalog Image (Production)**
```yaml
Use Case: Katalog görseli, müşteriye sunulacak
Quality Mode: HIGH
Cost: 8-12 token

Provider Chain:
  1. KIE nano-banana-pro
     - Multi-image support (model + product + scene)
     - Seamless integration
     - Physics-aware (kıyafet oturması)
     Cost: 8-12 token
     
  2. Replicate flux-pro (fallback)
     - ControlNet support
     - Good integration
     Cost: 10-15 token
     
  3. FAL flux-pro (last resort)
     - Fast but good quality
     Cost: 6-10 token

Parameters:
  - Resolution: 4K
  - Aspect Ratio: 3:4 or 9:16
  - Output Format: WEBP
  - Image Inputs: [model, product, scene]
  - Prompt: Full + product details
```

#### **B. Batch Generation (Bulk)**
```yaml
Use Case: 100+ ürün, toplu üretim
Quality Mode: STANDARD
Cost: 3-5 token

Provider Chain:
  1. KIE nano-banana-flash
     - Good quality/speed balance
     - Batch support
     Cost: 3-5 token
     
  2. Replicate flux-dev (fallback)
     - Batch API available
     - Reliable
     Cost: 4-6 token
     
  3. FAL flux-dev (last resort)
     - Fast batch processing
     Cost: 2-4 token

Parameters:
  - Resolution: 2K
  - Aspect Ratio: 3:4
  - Output Format: WEBP
  - Batch Size: 10-50
```

---

### **3. SCENE BACKGROUND GENERATION**

#### **A. Custom Scene (Production)**
```yaml
Use Case: Özel sahne arka planı
Quality Mode: STANDARD
Cost: 2-3 token

Provider Chain:
  1. KIE nano-banana-flash
     - Good quality for backgrounds
     - Fast enough
     Cost: 2-3 token
     
  2. Replicate flux-dev (fallback)
     - Good for scenes
     Cost: 3-4 token
     
  3. FAL flux-dev (last resort)
     - Fast
     Cost: 2-3 token

Parameters:
  - Resolution: 2K
  - Aspect Ratio: 16:9 or 9:16
  - Output Format: WEBP
  - Prompt: Scene description + lighting + mood
```

#### **B. Quick Preview**
```yaml
Use Case: Sahne önizleme
Quality Mode: FAST
Cost: 1 token

Provider Chain:
  1. FAL flux-schnell
     - Very fast for previews
     Cost: 0.5 token
     
  2. KIE nano-banana-lite (fallback)
     - Fast
     Cost: 1 token

Parameters:
  - Resolution: 1K
  - Aspect Ratio: 16:9
  - Output Format: WEBP
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Model Configuration Database:**

```typescript
// backend/src/ai-image/model-config.ts

export const MODEL_CONFIG = {
  // KIE Models
  KIE: {
    FAST: {
      modelId: 'google/nano-banana-lite',
      maxResolution: '1K',
      avgCost: 1,
      avgResponseTime: 2000, // ms
      bestFor: ['preview', 'test', 'quick']
    },
    STANDARD: {
      modelId: 'google/nano-banana-flash',
      maxResolution: '2K',
      avgCost: 3,
      avgResponseTime: 4000,
      bestFor: ['batch', 'background', 'standard']
    },
    HIGH: {
      modelId: 'google/nano-banana-pro',
      maxResolution: '4K',
      avgCost: 8,
      avgResponseTime: 8000,
      bestFor: ['final', 'production', 'catalog']
    }
  },
  
  // Replicate Models
  REPLICATE: {
    FAST: {
      modelId: 'stability-ai/sdxl-turbo',
      maxResolution: '1K',
      avgCost: 0.3,
      avgResponseTime: 3000
    },
    STANDARD: {
      modelId: 'black-forest-labs/flux-dev',
      maxResolution: '2K',
      avgCost: 4,
      avgResponseTime: 6000
    },
    HIGH: {
      modelId: 'black-forest-labs/flux-pro',
      maxResolution: '4K',
      avgCost: 10,
      avgResponseTime: 12000
    }
  },
  
  // FAL Models
  FAL: {
    FAST: {
      modelId: 'fal-ai/flux-schnell',
      maxResolution: '1K',
      avgCost: 0.5,
      avgResponseTime: 1500
    },
    STANDARD: {
      modelId: 'fal-ai/flux-dev',
      maxResolution: '2K',
      avgCost: 2.5,
      avgResponseTime: 3000
    },
    HIGH: {
      modelId: 'fal-ai/flux-pro',
      maxResolution: '4K',
      avgCost: 6,
      avgResponseTime: 5000
    }
  }
};
```

---

### **Smart Model Selector:**

```typescript
// backend/src/ai-image/model-selector.service.ts

@Injectable()
export class ModelSelectorService {
  
  /**
   * Select best model based on use case and quality mode
   */
  selectModel(params: {
    provider: AiProviderType;
    qualityMode: QualityMode;
    useCase?: 'model_profile' | 'product_generation' | 'scene_background';
    isPreview?: boolean;
    isBatch?: boolean;
  }): ModelConfig {
    
    const { provider, qualityMode, useCase, isPreview, isBatch } = params;
    
    // Override for specific use cases
    if (isPreview) {
      // Always use FAST for previews
      return MODEL_CONFIG[provider].FAST;
    }
    
    if (isBatch && qualityMode === 'HIGH') {
      // Downgrade to STANDARD for batch to save costs
      return MODEL_CONFIG[provider].STANDARD;
    }
    
    // Use case specific optimization
    if (useCase === 'scene_background' && qualityMode === 'HIGH') {
      // Backgrounds don't need highest quality
      return MODEL_CONFIG[provider].STANDARD;
    }
    
    // Default: use quality mode mapping
    return MODEL_CONFIG[provider][qualityMode];
  }
  
  /**
   * Get estimated cost for generation
   */
  estimateCost(params: {
    provider: AiProviderType;
    qualityMode: QualityMode;
    count?: number;
  }): number {
    const model = this.selectModel(params);
    const count = params.count || 1;
    return model.avgCost * count;
  }
}
```

---

### **Updated Provider Selector with Model Selection:**

```typescript
// backend/src/ai-image/provider-selector.service.ts

async selectProviderAndModel(params: {
  organizationId?: number;
  qualityMode: QualityMode;
  useCase?: string;
  isPreview?: boolean;
  isBatch?: boolean;
}): Promise<{
  provider: AiProviderConfig;
  model: ModelConfig;
}> {
  
  // Get provider chain based on quality mode
  const providerChain = await this.getProviderChain(
    params.organizationId,
    params.qualityMode
  );
  
  // Try each provider in chain
  for (const providerConfig of providerChain) {
    const health = await this.checkProviderHealth(providerConfig);
    
    if (health.isHealthy) {
      // Select appropriate model for this provider
      const model = this.modelSelector.selectModel({
        provider: providerConfig.provider,
        qualityMode: params.qualityMode,
        useCase: params.useCase,
        isPreview: params.isPreview,
        isBatch: params.isBatch
      });
      
      return { provider: providerConfig, model };
    }
  }
  
  // Fallback to first provider even if unhealthy
  const fallbackProvider = providerChain[0];
  const fallbackModel = this.modelSelector.selectModel({
    provider: fallbackProvider.provider,
    qualityMode: params.qualityMode
  });
  
  return { provider: fallbackProvider, model: fallbackModel };
}

/**
 * Get provider chain optimized for quality mode
 */
private async getProviderChain(
  organizationId?: number,
  qualityMode: QualityMode = 'STANDARD'
): Promise<AiProviderConfig[]> {
  
  const allProviders = await this.prisma.aiProviderConfig.findMany({
    where: {
      OR: [
        { organizationId },
        { organizationId: null }
      ],
      isActive: true
    },
    orderBy: { priority: 'asc' }
  });
  
  // Optimize chain based on quality mode
  if (qualityMode === 'FAST') {
    // For FAST: KIE → FAL → Replicate
    return this.sortProviders(allProviders, ['KIE', 'FAL', 'REPLICATE']);
  }
  
  if (qualityMode === 'HIGH') {
    // For HIGH: KIE → Replicate → FAL
    return this.sortProviders(allProviders, ['KIE', 'REPLICATE', 'FAL']);
  }
  
  // Default STANDARD: KIE → Replicate → FAL
  return allProviders;
}
```

---

## 📊 **COST OPTIMIZATION MATRIX**

### **Monthly Usage Estimate:**

```
Model Profile Generation:
├─ Preview (FAST): 2000 × 1 token = 2,000 tokens
├─ Final (HIGH): 500 × 8 tokens = 4,000 tokens
└─ Total: 6,000 tokens

Product on Model:
├─ Batch (STANDARD): 3000 × 3 tokens = 9,000 tokens
├─ Final (HIGH): 1000 × 8 tokens = 8,000 tokens
└─ Total: 17,000 tokens

Scene Background:
├─ Preview (FAST): 500 × 1 token = 500 tokens
├─ Production (STANDARD): 500 × 2 tokens = 1,000 tokens
└─ Total: 1,500 tokens

GRAND TOTAL: 24,500 tokens/month
```

### **Cost Breakdown:**

```
Primary (KIE - 85%):
24,500 × 0.85 = 20,825 tokens
20,825 × $0.01 = $208.25

Fallback (Replicate - 10%):
24,500 × 0.10 = 2,450 tokens
2,450 × $0.015 = $36.75

Emergency (FAL - 5%):
24,500 × 0.05 = 1,225 tokens
1,225 × $0.008 = $9.80

TOTAL: ~$255/month
```

---

## 🎯 **DECISION TREE**

```
Generation Request
    ↓
Is Preview?
├─ YES → FAST mode
│   ├─ KIE nano-banana-lite
│   ├─ FAL flux-schnell
│   └─ Replicate sdxl-turbo
│
└─ NO → Check Use Case
    ↓
    Is Batch? (>10 items)
    ├─ YES → STANDARD mode
    │   ├─ KIE nano-banana-flash
    │   ├─ Replicate flux-dev
    │   └─ FAL flux-dev
    │
    └─ NO → Check Quality
        ↓
        User Selected Quality
        ├─ FAST → lite/schnell/turbo
        ├─ STANDARD → flash/dev/dev
        └─ HIGH → pro/pro/pro
```

---

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: Model Configuration** (1 hour)
```
✅ Create MODEL_CONFIG constant
✅ Implement ModelSelectorService
✅ Add model selection to provider chain
✅ Update database schema for model tracking
```

### **Phase 2: Provider Chain Optimization** (1 hour)
```
✅ Implement quality-based provider ordering
✅ Add use-case specific optimizations
✅ Implement cost estimation
```

### **Phase 3: Frontend Integration** (1 hour)
```
✅ Show estimated cost before generation
✅ Display selected model info
✅ Add quality mode selector
✅ Show provider/model in generation history
```

### **Phase 4: Testing** (1 hour)
```
✅ Test all quality modes
✅ Test fallback scenarios
✅ Test cost calculations
✅ Test batch processing
```

---

## 📋 **CONFIGURATION EXAMPLE**

### **System Admin Settings:**

```json
{
  "providers": [
    {
      "provider": "KIE",
      "priority": 1,
      "models": {
        "FAST": "google/nano-banana-lite",
        "STANDARD": "google/nano-banana-flash",
        "HIGH": "google/nano-banana-pro"
      },
      "isActive": true
    },
    {
      "provider": "REPLICATE",
      "priority": 2,
      "models": {
        "FAST": "stability-ai/sdxl-turbo",
        "STANDARD": "black-forest-labs/flux-dev",
        "HIGH": "black-forest-labs/flux-pro"
      },
      "isActive": true
    },
    {
      "provider": "FAL",
      "priority": 3,
      "models": {
        "FAST": "fal-ai/flux-schnell",
        "STANDARD": "fal-ai/flux-dev",
        "HIGH": "fal-ai/flux-pro"
      },
      "isActive": true
    }
  ]
}
```

---

## ✅ **SUCCESS METRICS**

- [ ] 99.9% uptime (with fallback)
- [ ] <5s average response time
- [ ] <$300/month total cost
- [ ] >95% using primary provider (KIE)
- [ ] <5% using fallback providers
- [ ] Automatic recovery within 5 minutes
- [ ] Zero manual intervention needed

---

**Bu stratejiyi uygulayalım mı?** 🚀
