# 🔍 AI Servis Yönetimi - Mevcut Durum Analizi ve Plan

**Tarih:** 28 Kasım 2025  
**Kapsam:** Servis Bağlantıları + Master Prompt Entegrasyonu

---

## 📊 **MEVCUT DURUM ANALİZİ**

### **1. AI Provider Yapısı** ✅ (Kısmen Hazır)

#### **Backend Altyapısı:**
```
✅ AiProviderConfig (Database Model)
   - provider (KIE, REPLICATE, FAL)
   - apiKey
   - baseUrl
   - modelId
   - settings (JSON)
   - isActive
   - organizationId (null = global, değer = org-specific)

✅ Provider Implementations:
   - KieImageProvider ✅ (Çalışıyor)
   - ReplicateImageProvider ❌ (Not implemented)
   - FalImageProvider ❌ (Not implemented)

✅ AiImageService (Orchestrator)
   - generateForOrganization()
   - getOrgProviderConfig() (org > global fallback)
```

#### **Frontend:**
```
❌ /system-admin/services sayfası
   - Provider listesi gösteriyor
   - CRUD işlemleri var AMA:
     ❌ Test butonu yok
     ❌ Connection validation yok
     ❌ Real-time status yok
     ❌ Error details gösterilmiyor
```

---

### **2. Master Prompt Yapısı** ⚠️ (Kısmi)

#### **Backend:**
```
✅ Settings tablosu var
   - key: 'master_prompt'
   - value: string
   - organizationId

✅ Model Profile Service'de kullanılıyor:
   - generateReferenceImage() içinde
   - master_prompt çekiliyor
   - Prompt'a ekleniyor

❌ Eksikler:
   - Generation service'de kullanılmıyor
   - Scene generation'da kullanılmıyor
   - Product generation'da kullanılmıyor
```

#### **Frontend:**
```
❌ Master prompt yönetim arayüzü yok
❌ Organizasyon bazlı master prompt ayarı yok
❌ Kullanıcı prompt + master prompt birleştirme görünmüyor
```

---

## 🎯 **HEDEFLER**

### **1. Servis Yönetimi (Öncelik: YÜKSEK)**
- ✅ Provider CRUD (var)
- ❌ Connection Test
- ❌ Real-time Status
- ❌ Error Logging & Display
- ❌ Fallback Configuration
- ❌ Rate Limiting Info

### **2. Master Prompt Entegrasyonu (Öncelik: YÜKSEK)**
- ❌ Master Prompt UI
- ❌ Organizasyon bazlı ayar
- ❌ Tüm generation endpoint'lerinde kullanım
- ❌ Prompt birleştirme stratejisi
- ❌ Preview/Test özelliği

---

## 🏗️ **ÖNERİLEN MİMARİ**

### **Katman 1: Provider Management**

```
┌─────────────────────────────────────────┐
│  SYSTEM ADMIN - Provider Management     │
├─────────────────────────────────────────┤
│                                         │
│  Provider List                          │
│  ┌────────────────────────────────┐    │
│  │ KIE Provider                   │    │
│  │ Status: ● Active               │    │
│  │ API Key: ****1234              │    │
│  │ Model: nano-banana-pro         │    │
│  │                                │    │
│  │ [Test Connection] [Edit] [❌]  │    │
│  └────────────────────────────────┘    │
│                                         │
│  [+ Add Provider]                       │
└─────────────────────────────────────────┘
```

**Özellikler:**
1. **Test Connection** butonu
   - API'ye test request gönder
   - Response time göster
   - Success/Error durumu
   
2. **Real-time Status**
   - Last successful call
   - Error count (son 24 saat)
   - Average response time

3. **Fallback Chain**
   - Primary provider
   - Fallback provider(s)
   - Automatic failover

---

### **Katman 2: Master Prompt System**

```
┌─────────────────────────────────────────┐
│  SETTINGS - Master Prompts              │
├─────────────────────────────────────────┤
│                                         │
│  Global Master Prompt (System-wide)     │
│  ┌────────────────────────────────┐    │
│  │ high quality, professional     │    │
│  │ photography, 8k, photorealistic│    │
│  └────────────────────────────────┘    │
│                                         │
│  Organization Master Prompt             │
│  ┌────────────────────────────────┐    │
│  │ brand style, minimalist,       │    │
│  │ modern aesthetic               │    │
│  └────────────────────────────────┘    │
│                                         │
│  [Preview] [Save]                       │
└─────────────────────────────────────────┘
```

**Prompt Birleştirme Stratejisi:**
```
Final Prompt = 
  [Base Context] + 
  [User Attributes] + 
  [User Custom Prompt] + 
  [Organization Master Prompt] + 
  [Global Master Prompt]
```

**Örnek:**
```
Base: "Professional model photo, front view"
Attributes: "female, age 25-30, athletic, fair skin"
User: "smiling, white background"
Org Master: "brand style, minimalist"
Global Master: "high quality, 8k, photorealistic"

Final: "Professional model photo, front view, female, 
age 25-30, athletic, fair skin, smiling, white background, 
brand style, minimalist, high quality, 8k, photorealistic"
```

---

## 📋 **UYGULAMA PLANI**

### **Faz 1: Provider Test & Status** (2-3 saat)

#### **Backend:**
1. **Test Endpoint Oluştur**
   ```typescript
   POST /system-admin/providers/:id/test
   Response: {
     success: boolean,
     responseTime: number,
     error?: string,
     testImage?: string
   }
   ```

2. **Status Endpoint**
   ```typescript
   GET /system-admin/providers/:id/status
   Response: {
     isActive: boolean,
     lastSuccessfulCall: Date,
     errorCount24h: number,
     avgResponseTime: number
   }
   ```

#### **Frontend:**
1. Test butonu ekle
2. Status badge'leri ekle
3. Error log modal'ı
4. Real-time status polling

---

### **Faz 2: Master Prompt UI** (2 saat)

#### **Backend:**
1. **Settings Endpoints**
   ```typescript
   GET /settings/master-prompt
   PUT /settings/master-prompt
   ```

2. **Preview Endpoint**
   ```typescript
   POST /settings/master-prompt/preview
   Body: { userPrompt, attributes }
   Response: { finalPrompt }
   ```

#### **Frontend:**
1. Settings sayfasında Master Prompt bölümü
2. Global + Organization prompt alanları
3. Preview butonu
4. Örnek gösterimi

---

### **Faz 3: Prompt Entegrasyonu** (3 saat)

#### **Backend:**
1. **Prompt Builder Service**
   ```typescript
   class PromptBuilderService {
     async buildFinalPrompt(params: {
       baseContext: string,
       attributes: object,
       userPrompt: string,
       organizationId: number
     }): Promise<string>
   }
   ```

2. **Tüm Generation Service'lerde Kullan**
   - ModelProfilesService ✅ (Var)
   - GenerationService ❌ (Ekle)
   - ScenesService ❌ (Ekle)

#### **Frontend:**
1. Prompt preview her yerde
2. "What AI will see" tooltip
3. Prompt breakdown gösterimi

---

## 🔧 **TEKNİK DETAYLAR**

### **Provider Test Implementation:**

```typescript
// backend/src/modules/admin/admin.service.ts
async testProvider(id: number) {
  const provider = await this.prisma.aiProviderConfig.findUnique({
    where: { id }
  });

  const startTime = Date.now();
  
  try {
    // Test prompt
    const testPrompt = "professional model photo, test image";
    
    // Call AI service
    const imageUrl = await this.aiImageService.generateWithConfig(
      provider,
      { prompt: testPrompt, aspectRatio: "1:1" }
    );
    
    const responseTime = Date.now() - startTime;
    
    return {
      success: true,
      responseTime,
      testImage: imageUrl
    };
  } catch (error) {
    return {
      success: false,
      responseTime: Date.now() - startTime,
      error: error.message
    };
  }
}
```

### **Master Prompt Builder:**

```typescript
// backend/src/services/prompt-builder.service.ts
@Injectable()
export class PromptBuilderService {
  constructor(private prisma: PrismaService) {}

  async buildFinalPrompt(params: {
    baseContext: string;
    attributes?: Record<string, any>;
    userPrompt?: string;
    organizationId: number;
  }): Promise<string> {
    const parts: string[] = [];

    // 1. Base context
    parts.push(params.baseContext);

    // 2. Attributes
    if (params.attributes) {
      const attrStr = Object.entries(params.attributes)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${v}`)
        .join(', ');
      if (attrStr) parts.push(attrStr);
    }

    // 3. User prompt
    if (params.userPrompt) {
      parts.push(params.userPrompt);
    }

    // 4. Organization master prompt
    const orgPrompt = await this.prisma.setting.findFirst({
      where: {
        organizationId: params.organizationId,
        key: 'master_prompt'
      }
    });
    if (orgPrompt?.value) {
      parts.push(orgPrompt.value);
    }

    // 5. Global master prompt
    const globalPrompt = await this.prisma.setting.findFirst({
      where: {
        organizationId: null,
        key: 'master_prompt'
      }
    });
    if (globalPrompt?.value) {
      parts.push(globalPrompt.value);
    }

    return parts.filter(Boolean).join(', ');
  }
}
```

---

## ✅ **BAŞARI KRİTERLERİ**

### **Provider Management:**
- [ ] Her provider için test butonu çalışıyor
- [ ] Test sonuçları görüntüleniyor
- [ ] Real-time status güncelleniyor
- [ ] Error log'lar okunabilir
- [ ] Fallback chain yapılandırılabilir

### **Master Prompt:**
- [ ] Global master prompt ayarlanabiliyor
- [ ] Organization master prompt ayarlanabiliyor
- [ ] Tüm generation'larda kullanılıyor
- [ ] Preview çalışıyor
- [ ] Prompt breakdown gösteriliyor

---

## 🚀 **ÖNERİLEN UYGULAMA SIRASI**

1. **Provider Test (Öncelik 1)** - 2 saat
   - Backend test endpoint
   - Frontend test butonu
   - Status display

2. **Master Prompt UI (Öncelik 2)** - 2 saat
   - Settings sayfası
   - CRUD işlemleri
   - Preview

3. **Prompt Entegrasyonu (Öncelik 3)** - 3 saat
   - PromptBuilderService
   - Tüm service'lerde kullanım
   - Frontend preview

**Toplam Süre:** ~7 saat

---

## 💡 **EK ÖNERİLER**

### **1. Provider Monitoring:**
- Prometheus metrics
- Grafana dashboard
- Alert system

### **2. Prompt Versioning:**
- Master prompt history
- Rollback özelliği
- A/B testing

### **3. Cost Tracking:**
- Provider başına maliyet
- Organization başına kullanım
- Budget alerts

---

## 🎯 **SONUÇ**

**Mevcut Durum:**
- ✅ Provider altyapısı var
- ⚠️ Test/monitoring eksik
- ⚠️ Master prompt kısmi

**Hedef Durum:**
- ✅ Tam test edilebilir provider yönetimi
- ✅ Real-time monitoring
- ✅ Kapsamlı master prompt sistemi
- ✅ Tüm generation'larda tutarlı prompt

**Kritik Öneme Sahip:**
1. Provider test özelliği (Production'da sorun yaşanmaması için)
2. Master prompt entegrasyonu (Kalite tutarlılığı için)

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Durum:** Plan Hazır - Uygulama Bekliyor
