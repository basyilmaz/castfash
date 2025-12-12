# 🎯 UPDATED: AI Provider & Model Strategy (2 Models + User Choice)

**Tarih:** 28 Kasım 2025  
**Güncelleme:** Sadece 2 Model + Kullanıcı Seçimi

---

## 📊 **YENİ MODEL STRATEJİSİ**

### **Kullanılacak Modeller:**

```
✅ Nano Banana (Flash) - STANDARD
   - Hızlı ve dengeli
   - Çoğu senaryo için yeterli
   - Maliyet: 3 token
   - Varsayılan seçim

✅ Nano Banana Pro - HIGH
   - En yüksek kalite
   - Final üretimler için
   - Maliyet: 8 token
   - Kullanıcı seçimi

❌ Nano Banana Lite - KALDIRILDI
   - Artık kullanılmayacak
```

---

## 🎨 **KULLANICI SEÇİM SİSTEMİ**

### **1. Model Profile Generation**

#### **UI - Görsel Üretme Butonu:**
```tsx
┌─────────────────────────────────────────┐
│  AI ile Görsel Üret                     │
├─────────────────────────────────────────┤
│                                         │
│  Kalite Seçimi:                         │
│  ○ Standart (Hızlı, 3 token)           │
│  ● Yüksek Kalite (Yavaş, 8 token)      │
│                                         │
│  Ek Açıklama:                           │
│  ┌─────────────────────────────────┐   │
│  │ Gülen, beyaz arka plan...       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [İptal] [✨ Üret]                      │
└─────────────────────────────────────────┘
```

---

### **2. Product on Model Generation (Wizard)**

#### **Wizard Step: Kalite Seçimi**
```tsx
┌─────────────────────────────────────────┐
│  Adım 4/5: Kalite Ayarları              │
├─────────────────────────────────────────┤
│                                         │
│  Görsel Kalitesi:                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ Standart Kalite               │   │
│  │   • Hızlı üretim (3-5 saniye)   │   │
│  │   • İyi kalite                   │   │
│  │   • 3 token/görsel               │   │
│  │   • Toplu üretim için ideal      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ● Yüksek Kalite (Önerilen)      │   │
│  │   • Daha yavaş (8-12 saniye)    │   │
│  │   • Profesyonel kalite           │   │
│  │   • 8 token/görsel               │   │
│  │   • Katalog için ideal           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💡 İpucu: Katalog görselleri için     │
│     Yüksek Kalite önerilir             │
│                                         │
│  [← Geri] [İleri →]                    │
└─────────────────────────────────────────┘
```

---

### **3. Scene Background Generation**

#### **Sahne Oluşturma:**
```tsx
┌─────────────────────────────────────────┐
│  Arka Plan Üret                         │
├─────────────────────────────────────────┤
│                                         │
│  Kalite:                                │
│  ○ Standart (3 token) - Hızlı          │
│  ● Yüksek (8 token) - Detaylı          │
│                                         │
│  Açıklama:                              │
│  ┌─────────────────────────────────┐   │
│  │ Beyaz minimalist stüdyo...      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [✨ Üret]                              │
└─────────────────────────────────────────┘
```

---

## 🔧 **TEKNİK UYGULAMA**

### **Backend Model Mapping:**

```typescript
// backend/src/ai-image/model-config.ts

export enum QualityMode {
  STANDARD = 'STANDARD',  // Nano Banana (Flash)
  HIGH = 'HIGH'           // Nano Banana Pro
}

export const MODEL_CONFIG = {
  KIE: {
    STANDARD: {
      modelId: 'google/nano-banana',  // Flash version
      displayName: 'Standart Kalite',
      description: 'Hızlı ve dengeli, çoğu senaryo için yeterli',
      avgCost: 3,
      avgResponseTime: 4000, // 4 seconds
      maxResolution: '2K',
      recommended: ['batch', 'preview', 'background']
    },
    HIGH: {
      modelId: 'google/nano-banana-pro',
      displayName: 'Yüksek Kalite',
      description: 'Profesyonel kalite, katalog görselleri için',
      avgCost: 8,
      avgResponseTime: 10000, // 10 seconds
      maxResolution: '4K',
      recommended: ['final', 'catalog', 'production']
    }
  },
  
  // Fallback providers
  REPLICATE: {
    STANDARD: {
      modelId: 'black-forest-labs/flux-dev',
      avgCost: 4,
      avgResponseTime: 6000
    },
    HIGH: {
      modelId: 'black-forest-labs/flux-pro',
      avgCost: 10,
      avgResponseTime: 12000
    }
  },
  
  FAL: {
    STANDARD: {
      modelId: 'fal-ai/flux-dev',
      avgCost: 2.5,
      avgResponseTime: 3000
    },
    HIGH: {
      modelId: 'fal-ai/flux-pro',
      avgCost: 6,
      avgResponseTime: 5000
    }
  }
};
```

---

### **API Request Structure:**

```typescript
// POST /api/model-profiles/:id/generate-reference
{
  "view": "FACE" | "BACK",
  "prompt": "custom user prompt",
  "qualityMode": "STANDARD" | "HIGH"  // ← User choice
}

// POST /api/generations
{
  "modelProfileId": 123,
  "productId": 456,
  "sceneId": 789,
  "qualityMode": "STANDARD" | "HIGH",  // ← User choice
  "count": 4
}

// POST /api/scenes/:id/generate-background
{
  "prompt": "white minimalist studio",
  "qualityMode": "STANDARD" | "HIGH"  // ← User choice
}
```

---

### **Frontend Components:**

#### **Quality Selector Component:**

```tsx
// frontend/src/components/generation/QualitySelector.tsx

interface QualitySelectorProps {
  value: 'STANDARD' | 'HIGH';
  onChange: (quality: 'STANDARD' | 'HIGH') => void;
  showCost?: boolean;
}

export function QualitySelector({ value, onChange, showCost = true }: QualitySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white mb-2">
        Görsel Kalitesi
      </label>
      
      {/* Standard Option */}
      <button
        onClick={() => onChange('STANDARD')}
        className={`w-full p-4 rounded-lg border-2 transition-all ${
          value === 'STANDARD'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface hover:border-primary/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === 'STANDARD' ? 'border-primary' : 'border-border'
            }`}>
              {value === 'STANDARD' && (
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Standart Kalite</p>
              <p className="text-xs text-textMuted mt-1">
                Hızlı üretim • İyi kalite • Toplu işler için ideal
              </p>
            </div>
          </div>
          {showCost && (
            <div className="text-right">
              <p className="text-sm font-bold text-primary">3 token</p>
              <p className="text-xs text-textMuted">~4 saniye</p>
            </div>
          )}
        </div>
      </button>

      {/* High Option */}
      <button
        onClick={() => onChange('HIGH')}
        className={`w-full p-4 rounded-lg border-2 transition-all ${
          value === 'HIGH'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface hover:border-primary/50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              value === 'HIGH' ? 'border-primary' : 'border-border'
            }`}>
              {value === 'HIGH' && (
                <div className="w-3 h-3 rounded-full bg-primary"></div>
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-white flex items-center gap-2">
                Yüksek Kalite
                <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                  Önerilen
                </span>
              </p>
              <p className="text-xs text-textMuted mt-1">
                Profesyonel kalite • Katalog görselleri için
              </p>
            </div>
          </div>
          {showCost && (
            <div className="text-right">
              <p className="text-sm font-bold text-primary">8 token</p>
              <p className="text-xs text-textMuted">~10 saniye</p>
            </div>
          )}
        </div>
      </button>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-300">
          💡 <span className="font-bold">İpucu:</span> Katalog görselleri için 
          Yüksek Kalite önerilir. Toplu üretim için Standart Kalite yeterlidir.
        </p>
      </div>
    </div>
  );
}
```

---

## 📋 **WIZARD ENTEGRASYONU**

### **Generation Wizard Steps:**

```
Step 1: Model Seçimi
   └─ Model profile listesi

Step 2: Ürün Seçimi
   └─ Product listesi

Step 3: Sahne Seçimi
   └─ Scene preset listesi

Step 4: Kalite Ayarları ← YENİ!
   ├─ Quality mode selector
   ├─ Aspect ratio
   ├─ Resolution
   └─ Output count

Step 5: Önizleme & Üret
   ├─ Seçimlerin özeti
   ├─ Toplam maliyet
   └─ Üret butonu
```

---

### **Step 4 Implementation:**

```tsx
// frontend/src/components/generation/wizard/Step4Quality.tsx

export function Step4Quality({ 
  formData, 
  updateFormData, 
  onNext, 
  onBack 
}: StepProps) {
  const [qualityMode, setQualityMode] = useState<'STANDARD' | 'HIGH'>('HIGH');
  const [count, setCount] = useState(4);

  const estimatedCost = qualityMode === 'STANDARD' 
    ? count * 3 
    : count * 8;

  const estimatedTime = qualityMode === 'STANDARD'
    ? count * 4  // seconds
    : count * 10;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Kalite Ayarları
        </h2>
        <p className="text-textMuted">
          Görsel kalitesi ve üretim sayısını belirleyin
        </p>
      </div>

      {/* Quality Selector */}
      <QualitySelector
        value={qualityMode}
        onChange={setQualityMode}
      />

      {/* Output Count */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Üretilecek Görsel Sayısı
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="10"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value))}
            className="flex-1"
          />
          <div className="w-16 text-center">
            <p className="text-2xl font-bold text-white">{count}</p>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="p-4 bg-surface rounded-lg border border-border">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-textMuted">Tahmini Maliyet:</p>
          <p className="text-lg font-bold text-primary">{estimatedCost} token</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-sm text-textMuted">Tahmini Süre:</p>
          <p className="text-sm text-white">{estimatedTime} saniye</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <AppButton variant="secondary" onClick={onBack}>
          ← Geri
        </AppButton>
        <AppButton 
          onClick={() => {
            updateFormData({ qualityMode, count });
            onNext();
          }}
        >
          İleri →
        </AppButton>
      </div>
    </div>
  );
}
```

---

## 💰 **UPDATED COST ANALYSIS**

### **Model Comparison:**

| Model | Cost | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| Nano Banana | 3 token | 4s | ⭐⭐⭐⭐ | Batch, Preview |
| Nano Banana Pro | 8 token | 10s | ⭐⭐⭐⭐⭐ | Catalog, Final |

### **Monthly Estimate (Updated):**

```
Scenario 1: Mostly Standard (70/30 split)
├─ 7000 × 3 token = 21,000 tokens (Standard)
├─ 3000 × 8 token = 24,000 tokens (High)
└─ Total: 45,000 tokens × $0.01 = $450/month

Scenario 2: Balanced (50/50 split)
├─ 5000 × 3 token = 15,000 tokens (Standard)
├─ 5000 × 8 token = 40,000 tokens (High)
└─ Total: 55,000 tokens × $0.01 = $550/month

Scenario 3: Mostly High (30/70 split)
├─ 3000 × 3 token = 9,000 tokens (Standard)
├─ 7000 × 8 token = 56,000 tokens (High)
└─ Total: 65,000 tokens × $0.01 = $650/month
```

### **Recommendation:**
```
Encourage STANDARD for:
- Batch processing
- Internal previews
- Background generation

Encourage HIGH for:
- Final catalog images
- Client presentations
- Marketing materials
```

---

## 🎯 **USER EDUCATION**

### **In-App Guidance:**

```tsx
// Show contextual tips
<div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
  <p className="text-sm text-white">
    💡 <span className="font-bold">Öneri:</span>
    {useCase === 'batch' && 'Toplu üretim için Standart Kalite yeterlidir.'}
    {useCase === 'catalog' && 'Katalog görselleri için Yüksek Kalite önerilir.'}
    {useCase === 'preview' && 'Önizleme için Standart Kalite kullanın.'}
  </p>
</div>
```

---

## 📊 **ANALYTICS & TRACKING**

### **Track User Choices:**

```typescript
// Log quality mode usage
analytics.track('generation_created', {
  qualityMode: 'STANDARD' | 'HIGH',
  useCase: 'model_profile' | 'product' | 'scene',
  cost: number,
  duration: number
});

// Monthly report
{
  standardUsage: 70%,
  highUsage: 30%,
  avgCostPerGeneration: 4.5 tokens,
  totalCost: $450
}
```

---

## ✅ **IMPLEMENTATION CHECKLIST**

### **Backend:**
- [ ] Remove FAST mode references
- [ ] Update MODEL_CONFIG (only STANDARD & HIGH)
- [ ] Add qualityMode to all generation endpoints
- [ ] Update cost calculation
- [ ] Add quality mode to generation history

### **Frontend:**
- [ ] Create QualitySelector component
- [ ] Add to Model Profile generation modal
- [ ] Add Step 4 to Generation Wizard
- [ ] Add to Scene generation
- [ ] Show cost estimates
- [ ] Add contextual tips

### **Database:**
- [ ] Add qualityMode column to GenerationRequest
- [ ] Add qualityMode to ModelProfile generation logs
- [ ] Migration script

---

## 🚀 **ROLLOUT PLAN**

### **Phase 1: Backend** (2 hours)
1. Update model config
2. Add qualityMode parameter
3. Update cost calculation

### **Phase 2: Frontend Components** (2 hours)
1. Create QualitySelector
2. Add to existing modals
3. Create wizard step

### **Phase 3: Wizard Integration** (2 hours)
1. Add Step 4 to wizard
2. Update flow
3. Test end-to-end

### **Phase 4: Polish** (1 hour)
1. Add tips & guidance
2. Analytics tracking
3. Documentation

**Total: ~7 hours**

---

**Bu güncellenmiş planı uygulayalım mı?** 🚀
