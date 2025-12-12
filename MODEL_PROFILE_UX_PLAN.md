# 🎨 Model Profile Creation - UX Improvement Plan

**Sayfa:** `/model-profiles/new`  
**Hedef:** Kullanıcı dostu, dinamik, temiz arayüz  
**Tarih:** 28 Kasım 2025

---

## 📋 Mevcut Durum Analizi

### **Sorunlar:**
1. ❌ Tüm alanlar her zaman görünüyor
2. ❌ Model tipine göre gereksiz alanlar var
3. ❌ Karmaşık ve uzun form
4. ❌ Kullanıcı neyi dolduracağını bilmiyor
5. ❌ Wizard/step-by-step yok

### **Model Tipleri:**
1. **IMAGE_REFERENCE** (Görsel Referans)
   - Sadece görsel yükleme
   - Minimal text input
   
2. **TEXT_ONLY** (Sadece Metin)
   - Sadece text prompt'lar
   - Görsel yok
   
3. **HYBRID** (Hibrit)
   - Hem görsel hem text
   - En kapsamlı

---

## 🎯 Önerilen Çözüm

### **Yaklaşım: Dinamik Form + Wizard**

#### **Adım 1: Model Tipi Seçimi** (İlk Ekran)
```
┌─────────────────────────────────────────┐
│  Hangi tür model profili oluşturmak     │
│  istiyorsunuz?                           │
│                                          │
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ 📸 Görsel│  │ ✍️ Metin │  │ 🎨 Her │ │
│  │ Referans │  │  Prompt  │  │  İkisi │ │
│  │          │  │          │  │        │ │
│  │ Fotoğraf │  │ Sadece   │  │ Görsel │ │
│  │ yükle    │  │ açıklama │  │   +    │ │
│  │          │  │          │  │ Prompt │ │
│  └──────────┘  └──────────┘  └────────┘│
└─────────────────────────────────────────┘
```

#### **Adım 2: Dinamik Form (Model Tipine Göre)**

---

### **Senaryo 1: IMAGE_REFERENCE (Görsel Referans)**

**Gösterilecek Alanlar:**
```
✅ İsim
✅ Cinsiyet
✅ Yüz/Ön Görsel (Dosya yükle veya URL)
✅ Arka Görsel (Opsiyonel)
```

**Gizlenecek Alanlar:**
```
❌ Vücut tipi
❌ Ten tonu
❌ Saç rengi
❌ Saç stili
❌ Yaş aralığı
❌ Ön prompt
❌ Arka prompt
❌ Stil notu
```

**Mantık:**
- Görsel varsa AI otomatik analiz edecek
- Kullanıcı sadece görsel yükler
- Temiz, minimal form

---

### **Senaryo 2: TEXT_ONLY (Sadece Metin)**

**Wizard Adımları:**

**Step 1: Temel Bilgiler**
```
✅ İsim
✅ Cinsiyet
```

**Step 2: Fiziksel Özellikler** (Wizard)
```
✅ Vücut tipi (dropdown: İnce, Normal, Atletik, Dolgun)
✅ Ten tonu (dropdown: Açık, Orta, Esmer, Koyu)
✅ Yaş aralığı (dropdown: 18-25, 26-35, 36-45, 46+)
```

**Step 3: Saç Özellikleri** (Wizard)
```
✅ Saç rengi (dropdown: Siyah, Kahverengi, Sarı, Kızıl, Beyaz)
✅ Saç stili (dropdown: Kısa, Orta, Uzun, Dalgalı, Düz, Kıvırcık)
```

**Step 4: Stil Notları** (Wizard)
```
✅ Ön prompt (textarea)
✅ Arka prompt (textarea)
✅ Stil notu (textarea)
```

**Gizlenecek Alanlar:**
```
❌ Yüz/Ön Görsel
❌ Arka Görsel
```

**Mantık:**
- Wizard ile adım adım
- Her adımda 2-3 alan
- Progress bar
- İleri/Geri butonları

---

### **Senaryo 3: HYBRID (Hibrit)**

**Wizard Adımları:**

**Step 1: Temel Bilgiler**
```
✅ İsim
✅ Cinsiyet
```

**Step 2: Görsel Referanslar**
```
✅ Yüz/Ön Görsel
✅ Arka Görsel (Opsiyonel)
```

**Step 3: Fiziksel Özellikler** (Opsiyonel - "Görseli geliştirmek ister misiniz?")
```
⚪ Vücut tipi
⚪ Ten tonu
⚪ Yaş aralığı
⚪ Saç rengi
⚪ Saç stili
```

**Step 4: Stil Notları** (Opsiyonel)
```
⚪ Ön prompt
⚪ Arka prompt
⚪ Stil notu
```

**Mantık:**
- Görsel + Text birlikte
- Opsiyonel alanlar "Skip" edilebilir
- En esnek seçenek

---

## 🎨 UI/UX Tasarım Önerileri

### **1. Model Tipi Seçim Kartları**
```tsx
<div className="grid grid-cols-3 gap-6">
  <Card 
    icon="📸"
    title="Görsel Referans"
    description="Fotoğraf yükleyerek model oluştur"
    recommended={true}
    onClick={() => setModelType('IMAGE_REFERENCE')}
  />
  <Card 
    icon="✍️"
    title="Metin Prompt"
    description="Açıklama yazarak model oluştur"
    onClick={() => setModelType('TEXT_ONLY')}
  />
  <Card 
    icon="🎨"
    title="Hibrit"
    description="Görsel + Metin birlikte"
    advanced={true}
    onClick={() => setModelType('HYBRID')}
  />
</div>
```

### **2. Wizard Progress Bar**
```tsx
<div className="flex items-center justify-between mb-8">
  <Step number={1} label="Temel Bilgiler" active={currentStep === 1} completed={currentStep > 1} />
  <div className="flex-1 h-1 bg-border mx-4" />
  <Step number={2} label="Özellikler" active={currentStep === 2} completed={currentStep > 2} />
  <div className="flex-1 h-1 bg-border mx-4" />
  <Step number={3} label="Tamamla" active={currentStep === 3} />
</div>
```

### **3. Dinamik Form Gösterimi**
```tsx
{modelType === 'IMAGE_REFERENCE' && (
  <ImageReferenceForm />
)}

{modelType === 'TEXT_ONLY' && (
  <WizardForm steps={textOnlySteps} />
)}

{modelType === 'HYBRID' && (
  <WizardForm steps={hybridSteps} />
)}
```

### **4. Yardımcı İpuçları**
```tsx
<Tooltip>
  💡 İpucu: Yüksek kaliteli, net fotoğraflar daha iyi sonuç verir
</Tooltip>
```

---

## 🔧 Teknik Uygulama

### **Component Yapısı**

```
model-profiles/new/
├── page.tsx (Ana sayfa)
├── components/
│   ├── ModelTypeSelector.tsx (Tip seçimi)
│   ├── WizardProgress.tsx (Progress bar)
│   ├── ImageReferenceForm.tsx (Görsel form)
│   ├── TextOnlyWizard.tsx (Metin wizard)
│   ├── HybridWizard.tsx (Hibrit wizard)
│   └── FormStep.tsx (Wizard step wrapper)
```

### **State Yönetimi**

```tsx
const [modelType, setModelType] = useState<ModelType | null>(null);
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState({
  // Tüm alanlar
});

// Dinamik validation
const getRequiredFields = () => {
  switch(modelType) {
    case 'IMAGE_REFERENCE':
      return ['name', 'gender', 'faceReferenceUrl'];
    case 'TEXT_ONLY':
      return ['name', 'gender', 'bodyType', 'skinTone', 'frontPrompt'];
    case 'HYBRID':
      return ['name', 'gender', 'faceReferenceUrl', 'frontPrompt'];
  }
};
```

---

## 📊 Kullanıcı Akışı

### **Akış 1: Görsel Referans**
```
1. Model tipi seç → IMAGE_REFERENCE
2. İsim gir
3. Cinsiyet seç
4. Fotoğraf yükle (ön)
5. (Opsiyonel) Arka fotoğraf yükle
6. ✅ Oluştur
```
**Süre:** ~1-2 dakika

### **Akış 2: Sadece Metin**
```
1. Model tipi seç → TEXT_ONLY
2. Step 1: İsim + Cinsiyet
3. Step 2: Fiziksel özellikler (dropdown'lar)
4. Step 3: Saç özellikleri (dropdown'lar)
5. Step 4: Stil notları (textarea'lar)
6. ✅ Oluştur
```
**Süre:** ~3-4 dakika

### **Akış 3: Hibrit**
```
1. Model tipi seç → HYBRID
2. Step 1: İsim + Cinsiyet
3. Step 2: Fotoğraf yükle
4. Step 3: (Opsiyonel) Fiziksel özellikler
5. Step 4: (Opsiyonel) Stil notları
6. ✅ Oluştur
```
**Süre:** ~2-5 dakika

---

## ✅ Avantajlar

1. ✅ **Daha Az Karmaşık** - Sadece gerekli alanlar
2. ✅ **Kullanıcı Dostu** - Wizard ile adım adım
3. ✅ **Hızlı** - Gereksiz alanlar yok
4. ✅ **Esnek** - Her kullanım senaryosu destekleniyor
5. ✅ **Modern** - Progress bar, animasyonlar
6. ✅ **Mobil Uyumlu** - Wizard mobilde daha iyi

---

## 🎯 Öncelik Sırası

### **Faz 1: Temel İyileştirme** (30 dakika)
1. Model tipi seçim kartları
2. Dinamik form gösterimi
3. Gereksiz alanları gizleme

### **Faz 2: Wizard Ekleme** (45 dakika)
1. Wizard component'i
2. Progress bar
3. Step navigation

### **Faz 3: Polish** (15 dakika)
1. Animasyonlar
2. Tooltip'ler
3. Validation feedback

---

## 💡 Önerilen Başlangıç

**En hızlı ve etkili:** Faz 1'den başla
- Model tipi seçimi ekle
- Dinamik form gösterimi yap
- Gereksiz alanları gizle

Sonra kullanıcı feedback'ine göre Wizard ekle.

---

**Hazırlayan:** AI Assistant  
**Versiyon:** 1.0  
**Durum:** Plan Hazır - Onay Bekleniyor

---

## 🤔 Karar Noktaları

1. **Wizard gerekli mi yoksa sadece dinamik form yeterli mi?**
   - Öneri: Başta dinamik form, sonra wizard

2. **Dropdown'lar mı yoksa text input'lar mı?**
   - Öneri: TEXT_ONLY için dropdown (daha kolay)

3. **Opsiyonel alanlar nasıl gösterilmeli?**
   - Öneri: "Gelişmiş Seçenekler" accordion

**Hangi yaklaşımı tercih edersiniz?**
