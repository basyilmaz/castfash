# 🤖 AI Provider Stratejisi ve Kullanım Planı

**Tarih:** 28 Kasım 2025  
**Kapsam:** KIE Nano Banana, Replicate, FAL Karşılaştırması

---

## 📊 **1. KIE NANO BANANA ANALİZİ**

### **Modeller:**

#### **A. Nano Banana Pro (Gemini 3 Pro)**
```
✨ En Yüksek Kalite
- Hyper-realistic görüntüler
- Physics-aware (fizik kurallarına uygun)
- Seamless style transformations
- En yavaş, en pahalı

Kullanım Alanı: HIGH QUALITY mode
```

#### **B. Nano Banana Flash (Gemini 2.5 Flash)**
```
⚡ Hızlı ve Dengeli
- İyi kalite
- Hızlı üretim
- Makul fiyat

Kullanım Alanı: STANDARD mode
```

#### **C. Nano Banana Lite (Varsayılan)**
```
🚀 En Hızlı
- Temel kalite
- Çok hızlı
- En ucuz

Kullanım Alanı: FAST mode
```

---

### **KIE Özellikleri:**

#### **Image Generation:**
- ✅ Text-to-Image
- ✅ Multi-image input (8'e kadar)
- ✅ Aspect ratio kontrolü
- ✅ Resolution kontrolü (1K, 2K, 4K)
- ✅ Format seçimi (JPEG, PNG, WEBP)

#### **Image Editing:**
- ✅ Image-to-Image transformation
- ✅ Style transfer
- ✅ Multi-image editing (10'a kadar)

#### **Fiyatlandırma (Tahmini):**
```
Nano Banana Lite:  ~$0.01-0.02 / image
Nano Banana Flash: ~$0.03-0.05 / image
Nano Banana Pro:   ~$0.08-0.12 / image
```

---

## 🎯 **CASTFASH İÇİN KULLANIM PLANI**

### **Senaryo 1: Model Profile Generation**

#### **Use Case:** Model referans görseli üretme
```
Prompt: "Professional model photo, front view, female, 
age 25-30, athletic, fair skin, blonde hair, long hair, 
smiling, white background, high quality, 8k"

Önerilen Model: Nano Banana Pro
Neden: 
- Yüksek kalite gerekli (model referansı)
- Fiziksel özellikler doğru yansımalı
- Profesyonel görünüm şart

Maliyet: ~3-5 token/görsel
```

#### **Use Case:** Hızlı önizleme/test
```
Önerilen Model: Nano Banana Lite
Neden:
- Kullanıcı sadece test ediyor
- Hız önemli
- Düşük maliyet

Maliyet: ~1 token/görsel
```

---

### **Senaryo 2: Product on Model Generation**

#### **Use Case:** Final katalog görseli
```
Input: 
- Model referansı (1 görsel)
- Ürün görseli (1 görsel)
- Scene background (1 görsel)

Önerilen Model: Nano Banana Pro
Neden:
- Müşteriye sunulacak
- Yüksek kalite şart
- Fizik kuralları önemli (kıyafet oturması)
- Seamless integration gerekli

Maliyet: ~5-8 token/görsel
```

#### **Use Case:** Toplu üretim (batch)
```
Önerilen Model: Nano Banana Flash
Neden:
- Hız-kalite dengesi
- Makul maliyet
- Yeterli kalite

Maliyet: ~3-5 token/görsel
```

---

### **Senaryo 3: Scene Background Generation**

#### **Use Case:** Özel sahne arka planı
```
Prompt: "Studio background, white minimalist, 
soft lighting, professional photography, 8k"

Önerilen Model: Nano Banana Flash
Neden:
- Arka plan için yeterli kalite
- Hızlı üretim
- Makul maliyet

Maliyet: ~2-3 token/görsel
```

---

## 📋 **KULLANIM MATRİSİ**

| Senaryo | Quality Mode | Model | Maliyet | Hız | Kullanım |
|---------|-------------|-------|---------|-----|----------|
| Model Ref (Final) | HIGH | Pro | 5 token | Yavaş | Production |
| Model Ref (Test) | FAST | Lite | 1 token | Hızlı | Preview |
| Product on Model | HIGH | Pro | 8 token | Yavaş | Production |
| Batch Generation | STANDARD | Flash | 3 token | Orta | Bulk |
| Scene Background | STANDARD | Flash | 2 token | Orta | Production |
| Quick Preview | FAST | Lite | 1 token | Hızlı | Testing |

---

## 🔧 **TEKNİK UYGULAMA**

### **Backend Model Mapping:**

```typescript
// backend/src/ai-image/providers/kie-image.provider.ts

const MODEL_MAPPING = {
  FAST: 'google/nano-banana-lite',
  STANDARD: 'google/nano-banana-flash', 
  HIGH: 'google/nano-banana-pro'
};

async generateImage(options: AiImageGenerateOptions) {
  const modelId = MODEL_MAPPING[options.qualityMode] || 
                  this.envModelId || 
                  'google/nano-banana-flash';
  
  // KIE API call with selected model
  const response = await axios.post(
    `${baseUrl}/generate`,
    {
      prompt: options.prompt,
      model: modelId,
      aspect_ratio: options.aspectRatio,
      resolution: options.resolution,
      image_inputs: options.imageInputs,
      output_format: 'WEBP'
    }
  );
}
```

---

## 💰 **MALİYET OPTİMİZASYONU**

### **Strateji 1: Akıllı Model Seçimi**
```
IF user_action === "preview" THEN
  use Nano Banana Lite (1 token)
ELSE IF user_action === "batch" THEN
  use Nano Banana Flash (3 token)
ELSE IF user_action === "final" THEN
  use Nano Banana Pro (5-8 token)
```

### **Strateji 2: Caching**
```
- Aynı prompt + parametreler → Cache'den dön
- 24 saat cache süresi
- %30-50 maliyet tasarrufu
```

### **Strateji 3: Batch Processing**
```
- 10+ görsel → Batch API kullan
- %20 indirim
- Paralel işlem
```

---

## 🔄 **2. REPLICATE ANALİZİ**

### **Avantajlar:**
- ✅ Çok sayıda model seçeneği
- ✅ FLUX, Stable Diffusion, SDXL
- ✅ Özelleştirilebilir modeller
- ✅ API çok stabil

### **Dezavantajlar:**
- ❌ KIE'den daha pahalı
- ❌ Daha yavaş
- ❌ Karmaşık setup

### **Önerilen Kullanım:**
```
Fallback Provider olarak:
- KIE down olursa
- Özel model gerekirse (LoRA, fine-tuned)
- Spesifik stil gerekirse
```

### **Fiyatlandırma:**
```
FLUX Pro: ~$0.055 / image
SDXL: ~$0.0025 / image
Custom Models: Değişken
```

---

## ⚡ **3. FAL ANALİZİ**

### **Avantajlar:**
- ✅ En hızlı provider
- ✅ Real-time generation
- ✅ WebSocket support
- ✅ Makul fiyat

### **Dezavantajlar:**
- ❌ Daha az model seçeneği
- ❌ Kalite KIE'den düşük
- ❌ Daha az özelleştirme

### **Önerilen Kullanım:**
```
Speed-critical senaryolar:
- Live preview
- Interactive editing
- Real-time feedback
```

### **Fiyatlandırma:**
```
FLUX Schnell: ~$0.003 / image (çok hızlı)
FLUX Dev: ~$0.025 / image
```

---

## 🎯 **ÖNERİLEN PROVIDER STRATEJİSİ**

### **Primary Provider: KIE Nano Banana**
```
Neden:
✅ 3 model seçeneği (Lite, Flash, Pro)
✅ Mükemmel kalite/fiyat dengesi
✅ Multi-image support
✅ Aspect ratio kontrolü
✅ Türk şirketi (destek kolay)

Kullanım: %80-90 tüm işlemler
```

### **Secondary Provider: FAL**
```
Neden:
✅ Hız gerektiğinde
✅ Real-time preview
✅ Ucuz

Kullanım: %5-10 (preview, test)
```

### **Tertiary Provider: Replicate**
```
Neden:
✅ Fallback
✅ Özel modeller
✅ Spesifik stiller

Kullanım: %5 (özel durumlar)
```

---

## 📊 **UYGULAMA ÖNCELİĞİ**

### **Faz 1: KIE Entegrasyonu** (Şu an)
1. ✅ KIE provider implement edildi
2. ⏳ Model mapping ekle (Lite, Flash, Pro)
3. ⏳ Quality mode'a göre model seçimi
4. ⏳ Multi-image support

### **Faz 2: FAL Entegrasyonu** (Gelecek)
1. ⏳ FAL provider implement
2. ⏳ Real-time preview için kullan
3. ⏳ WebSocket integration

### **Faz 3: Replicate Entegrasyonu** (İhtiyaç halinde)
1. ⏳ Replicate provider implement
2. ⏳ Fallback logic
3. ⏳ Custom model support

---

## 💡 **AKILLI PROVIDER SEÇİMİ**

### **Algoritma:**
```typescript
function selectProvider(context: GenerationContext) {
  // 1. Kullanıcı tercihi
  if (context.userPreference) {
    return context.userPreference;
  }
  
  // 2. Quality mode
  if (context.qualityMode === 'HIGH') {
    return { provider: 'KIE', model: 'nano-banana-pro' };
  }
  
  if (context.qualityMode === 'FAST') {
    if (context.needRealtime) {
      return { provider: 'FAL', model: 'flux-schnell' };
    }
    return { provider: 'KIE', model: 'nano-banana-lite' };
  }
  
  // 3. Default: Standard quality
  return { provider: 'KIE', model: 'nano-banana-flash' };
}
```

---

## 📈 **BEKLENEN MALİYET**

### **Aylık Kullanım Tahmini:**
```
1000 model referansı × 3 token = 3,000 token
5000 product generation × 5 token = 25,000 token
500 scene background × 2 token = 1,000 token
2000 preview/test × 1 token = 2,000 token

TOPLAM: ~31,000 token/ay
```

### **Maliyet (KIE bazlı):**
```
Token başına ~$0.01 varsayımı:
31,000 token × $0.01 = $310/ay

Optimizasyonlarla:
- Cache: -30% → $217/ay
- Batch: -20% → $174/ay

HEDEF: ~$150-200/ay
```

---

## ✅ **SONUÇ VE ÖNERİLER**

### **1. KIE Nano Banana - Primary**
- ✅ 3 model (Lite, Flash, Pro)
- ✅ Quality mode mapping
- ✅ Multi-image support
- ✅ %80-90 kullanım

### **2. FAL - Speed Critical**
- ✅ Real-time preview
- ✅ Fast mode alternative
- ✅ %5-10 kullanım

### **3. Replicate - Fallback**
- ✅ Özel modeller
- ✅ Fallback
- ✅ %5 kullanım

### **Uygulama Sırası:**
1. **ŞİMDİ:** KIE model mapping (Lite, Flash, Pro)
2. **SONRA:** FAL entegrasyonu (preview için)
3. **İHTİYAÇ HALINDE:** Replicate (fallback)

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Durum:** Analiz Tamamlandı - Uygulama Bekliyor
