# Castfash UX İyileştirme Planı

## 1. Onboarding (İlk Kullanım Deneyimi)
- **Sorun:** Yeni kayıt olan kullanıcılar ne yapacaklarını bilemeyebilir.
- **Öneri:** Kayıt sonrası kullanıcıyı karşılayan ve "İlk Ürününü Oluştur" -> "Model Seç" -> "Sahne Seç" -> "Generate" adımlarını gösteren interaktif bir tur (tour) eklenmeli.

## 2. Görsel Yönetimi
- **Sorun:** Dosya yükleme şu an temel seviyede.
- **Öneri:**
    - **Sürükle-Bırak:** Dosya yükleme alanlarına sürükle-bırak desteği eklenmeli.
    - **Anlık Önizleme:** Yüklenen görselin küçük bir önizlemesi (thumbnail) gösterilmeli.
    - **Crop/Edit:** Yükleme öncesi basit kırpma (crop) aracı eklenmeli.

## 3. Toplu İşlemler (Batch Operations)
- **Sorun:** Tek tek ürün eklemek zaman alıcı.
- **Öneri:**
    - **Excel/CSV Import:** Toplu ürün listesi yükleme.
    - **Klasör Yükleme:** Bir klasördeki tüm görselleri tek seferde yükleyip ürün oluşturma.

## 4. Geri Bildirim ve Bildirimler
- **Sorun:** Hata ve başarı mesajları bazen gözden kaçabilir.
- **Öneri:**
    - **Toast Notifications:** Sağ üst köşede beliren, otomatik kaybolan şık bildirimler (örn: `sonner` veya `react-hot-toast` kütüphanesi).
    - **Progress Bar:** Uzun süren generation işlemleri için ilerleme çubuğu.

## 5. Dashboard Tasarımı
- **Sorun:** Dashboard tasarımı, marketing sayfasına göre sönük kalabilir.
- **Öneri:**
    - **Dark Mode:** Tamamen karanlık mod ve neon vurgularla (AIForge teması) dashboard'un da premium hissettirmesi.
    - **Dashboard Widgetları:** Ana sayfada "Kalan Kredi", "Son Üretilenler", "Popüler Modeller" gibi özet kartları.

## 6. Mobil Deneyim
- **Sorun:** Admin paneli mobilde zor kullanılabilir.
- **Öneri:** Sidebar'ın mobilde tamamen gizlenip hamburger menü ile açılması, tabloların kart görünümüne dönüşmesi (responsive design).
