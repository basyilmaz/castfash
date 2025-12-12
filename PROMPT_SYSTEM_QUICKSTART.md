# Prompt Ayarları Sistemi - Hızlı Başlangıç

## ✅ Tamamlanan İşler

### Database
- ✅ Prisma Schema eklendi
- ✅ Migration yapıldı
- ✅ 5 yeni model eklendi:
  - `PromptTemplate` - Master promptlar
  - `PromptVersion` - Versiyon geçmişi
  - `PromptPreset` - Hazır kombinasyonlar
  - `PromptCategory` - Kategoriler
  - `PromptAnalytics` - Performans verileri

### Backend
- ✅ `PromptService` oluşturuldu (tam fonksiyonel)
  - CRUD işlemleri
  - Versiyonlama
  - Analytics
  - Prompt birleştirme
  - Bulk operations
  - Import/Export

## 📋 Yapılması Gerekenler

### 1. Backend Tamamlama (15 dk)

**Dosyalar:**
```
backend/src/modules/prompt/
├── prompt.controller.ts  ← Oluştur (guide'da kod var)
├── prompt.module.ts      ← Oluştur (guide'da kod var)
└── prompt.service.ts     ✅ Hazır
```

**Adımlar:**
1. `prompt.controller.ts` dosyasını oluştur (PROMPT_SYSTEM_GUIDE.md'den kopyala)
2. `prompt.module.ts` dosyasını oluştur (PROMPT_SYSTEM_GUIDE.md'den kopyala)
3. `app.module.ts`'e `PromptModule`'ü ekle

### 2. Frontend Oluşturma (30 dk)

**Dosyalar:**
```
frontend/src/app/(system-admin)/system-admin/prompts/
├── page.tsx                           ← Ana sayfa (guide'da kod var)
└── components/
    ├── TemplatesTab.tsx               ← Templates listesi (guide'da kod var)
    ├── TemplateModal.tsx              ← Create/Edit modal (guide'da kod var)
    ├── PresetsTab.tsx                 ← Presets listesi (TemplatesTab benzeri)
    ├── PresetModal.tsx                ← Preset modal (TemplateModal benzeri)
    └── PlaygroundTab.tsx              ← Test alanı (guide'da kod var)
```

**Adımlar:**
1. Ana sayfa ve component'leri oluştur (guide'dan kopyala)
2. `layout.tsx`'e "Prompt Ayarları" menü item'ı ekle
3. Test et

### 3. Integration (10 dk)

**Generation Service'e entegrasyon:**
```typescript
// generation.service.ts içinde
const combinedPrompts = await this.promptService.combinePrompts({
    masterTemplateIds: [1, 2],
    sceneSelection: userInput.scene,
    poseSelection: userInput.pose,
    customPrompt: userInput.customPrompt,
    variables: {
        product_name: product.name,
        model_name: model.name,
    },
});

// AI'a gönder
const result = await aiService.generate({
    prompt: combinedPrompts.positive,
    negativePrompt: combinedPrompts.negative,
});
```

## 🎯 Özellikler

### Master Promptlar
- ✅ CRUD işlemleri
- ✅ Tip bazlı (MASTER, SCENE, POSE, LIGHTING, STYLE, NEGATIVE)
- ✅ Kategori bazlı (PRODUCT, MODEL, GENERAL, etc.)
- ✅ Priority sıralaması
- ✅ Aktif/Pasif durumu
- ✅ Tag sistemi
- ✅ Variable desteği ({product_name}, {model_name})

### Versiyonlama
- ✅ Her değişiklik yeni versiyon
- ✅ Versiyon geçmişi
- ✅ Geri alma özelliği (rollback)

### Preset'ler
- ✅ Hazır kombinasyonlar
- ✅ Scene + Pose + Lighting + Style
- ✅ Kullanım sayısı takibi

### Analytics
- ✅ Kullanım istatistikleri
- ✅ Başarı oranı
- ✅ Kalite skoru
- ✅ En çok kullanılan kombinasyonlar
- ✅ Sorunlu kombinasyonlar

### Test Alanı (Playground)
- ✅ Gerçek zamanlı önizleme
- ✅ Farklı kombinasyonları test etme
- ✅ Variable replacement
- ✅ Copy to clipboard

### Bulk Operations
- ✅ Toplu aktif/pasif yapma
- ✅ Toplu tag ekleme
- ✅ Export (JSON)
- ✅ Import (JSON)

## 📊 Kullanım Akışı

### 1. Admin Prompt Oluşturur
```
1. System Admin → Prompt Ayarları
2. "Master Promptlar" tab
3. "Yeni Prompt Ekle"
4. Form doldur → Kaydet
```

### 2. Test Eder
```
1. "Test Alanı" tab
2. Master promptları seç
3. Kullanıcı seçimlerini simüle et
4. "Önizleme Oluştur"
5. Sonucu görüntüle ve kopyala
```

### 3. Kullanıcı Üretim Yapar
```
1. Kullanıcı UI'dan seçimlerini yapar
2. Backend otomatik olarak promptları birleştirir
3. AI'a gönderir
4. Sonuç döner
5. Analytics'e kaydedilir
```

### 4. Admin Analytics İnceler
```
1. Template detayına git
2. "Analytics" butonuna tıkla
3. Performans verilerini gör
4. Gerekirse optimize et
```

## 🔗 API Endpoints

```
GET    /system-admin/prompts/templates
GET    /system-admin/prompts/templates/:id
POST   /system-admin/prompts/templates
PUT    /system-admin/prompts/templates/:id
DELETE /system-admin/prompts/templates/:id

GET    /system-admin/prompts/presets
POST   /system-admin/prompts/presets
PUT    /system-admin/prompts/presets/:id
DELETE /system-admin/prompts/presets/:id

GET    /system-admin/prompts/templates/:id/analytics
POST   /system-admin/prompts/preview

POST   /system-admin/prompts/templates/bulk-update
POST   /system-admin/prompts/templates/export
POST   /system-admin/prompts/templates/import
```

## 💡 Best Practices

### Prompt Yazımı
- ✅ Açık ve spesifik ol
- ✅ Virgülle ayır
- ✅ Önce genel, sonra spesifik
- ✅ Negative prompt'ları kullan
- ✅ Variables ile dinamik yap

### Organizasyon
- ✅ Priority kullan (önemli promptlar önce)
- ✅ Tag'lerle kategorize et
- ✅ Anlamlı isimler ver
- ✅ Versiyonları takip et

### Test
- ✅ Her değişikliği test et
- ✅ Farklı kombinasyonları dene
- ✅ Analytics'i düzenli incele
- ✅ Sorunlu kombinasyonları düzelt

## 📈 Örnek Prompt Yapısı

```
Master Product Prompt (Priority: 1)
└─ "Professional fashion photography, studio lighting, high quality, 
    detailed fabric texture, commercial product shot"

Master Model Prompt (Priority: 2)
└─ "Professional model, natural pose, clear facial features"

Scene Selection (Kullanıcı seçimi)
└─ "studio white background"

Pose Selection (Kullanıcı seçimi)
└─ "standing front view"

Custom Prompt (Kullanıcı yazısı)
└─ "model smiling, casual"

Variables
├─ {product_name} → "Blue Shirt"
└─ {model_name} → "John Doe"

FINAL PROMPT:
"Professional fashion photography, studio lighting, high quality, 
detailed fabric texture, commercial product shot, Professional model, 
natural pose, clear facial features, studio white background, 
standing front view, model smiling, casual, Blue Shirt on John Doe"
```

## 🚀 Hızlı Başlangıç

1. **Backend'i tamamla** (15 dk)
   - Controller ve Module oluştur
   - App Module'e ekle

2. **Frontend'i oluştur** (30 dk)
   - Tüm component'leri ekle
   - Navigation'a ekle

3. **Test et** (15 dk)
   - CRUD işlemlerini test et
   - Playground'u test et

4. **İlk prompt'ları oluştur** (10 dk)
   - Master Product Prompt
   - Master Model Prompt
   - Negative Prompt

5. **Generation'a entegre et** (10 dk)
   - Generation service'i güncelle
   - Test et

**Toplam süre: ~1.5 saat**

## 📚 Daha Fazla Bilgi

Detaylı kod örnekleri ve açıklamalar için:
👉 **PROMPT_SYSTEM_GUIDE.md** dosyasına bakın

---

Başarılar! 🎉
