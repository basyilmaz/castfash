# 🚨 Railway Deployment - Problem & Recovery Plan

**Version:** v1.0.0-pre-railway  
**Tarih:** 14 Aralık 2025  
**Stable Tag:** `v1.0.0-pre-railway`

---

## 🔒 Güvenli Deployment Stratejisi

### Altın Kural
> **HİÇBİR ZAMAN doğrudan main branch'e problem çıkarabilecek bir değişiklik yapmayın!**

### Rollback Komutu (Acil Durum)
```bash
# Herhangi bir sorun durumunda bu tag'e dönün:
git checkout v1.0.0-pre-railway
git push origin +v1.0.0-pre-railway:main --force

# Veya Railway'de:
Railway Dashboard → Deployments → "Rollback" to previous
```

---

## 📋 Olası Sorunlar ve Çözümleri

### 🔴 PROBLEM 1: Build Hatası - Node Version

**Belirti:**
```
Error: The engine "node" is incompatible with this module
```

**Çözüm:**
```json
// package.json'a ekle (backend & frontend)
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

**Önlem:** ✅ Zaten mevcut - kontrol edildi

---

### 🔴 PROBLEM 2: Prisma Migration Hatası

**Belirti:**
```
Error: P3009: migrate found failed migrations
Error: P3018: A migration failed to apply
```

**Çözümler:**

1. **Soft Reset (Veri korunur):**
```bash
railway run --service backend npx prisma migrate resolve --rolled-back "migration_name"
```

2. **Hard Reset (DİKKAT: Veri kaybolur!):**
```bash
railway run --service backend npx prisma migrate reset --force
```

**Önlem:** Migration'ları local'de test edin:
```bash
npx prisma migrate dev --name test_migration
npx prisma migrate reset  # Test sonrası sıfırla
```

---

### 🔴 PROBLEM 3: Health Check Timeout

**Belirti:**
```
Service unhealthy: Health check failed after 30s
```

**Çözümler:**

1. **Timeout artır:**
```json
// railway.json
{
  "deploy": {
    "healthcheckTimeout": 60
  }
}
```

2. **Basit health endpoint:**
```typescript
// Geçici çözüm - health.controller.ts
@Get('health')
health() {
  return { status: 'ok' };
}
```

**Önlem:** ✅ Health controller mevcut ve optimize

---

### 🔴 PROBLEM 4: Out of Memory (OOM)

**Belirti:**
```
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
```

**Çözümler:**

1. **Build için memory artır:**
```json
// railway.json
{
  "build": {
    "buildCommand": "NODE_OPTIONS='--max-old-space-size=4096' npm run build"
  }
}
```

2. **Railway plan yükselt:**
- Hobby: 512MB RAM → Pro: 8GB RAM

**Önlem:**
```bash
# Local test
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

---

### 🔴 PROBLEM 5: DATABASE_URL Bağlantı Hatası

**Belirti:**
```
Error: P1001: Can't reach database server
Error: P1000: Authentication failed
```

**Çözümler:**

1. **Railway reference kullan:**
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

2. **Connection string formatı:**
```
postgresql://user:password@host:5432/dbname?schema=public&connection_limit=5
```

**Önlem:** Railway'in PostgreSQL servisini başlattıktan sonra backend'i başlatın.

---

### 🔴 PROBLEM 6: CORS Hatası

**Belirti:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Çözümler:**

1. **Main.ts'de CORS güncelle:**
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
});
```

2. **Environment variable doğru ayarla:**
```
FRONTEND_URL=https://castfash-frontend.up.railway.app
```

**Önlem:** ✅ CORS zaten dinamik yapılandırılmış

---

### 🔴 PROBLEM 7: Static Files / Uploads Kaybı

**Belirti:**
```
Deployment sonrası upload edilmiş dosyalar kayıp
```

**Çözüm:** Railway ephemeral storage kullanır!

**Kalıcı Çözüm:**
```bash
# S3 veya Cloudinary entegrasyonu gerekli
# Şimdilik uploads klasörü Railway volume'a bağlanmalı
```

**Önlem:** Production'da external storage kullanın (S3, Cloudinary)

---

### 🔴 PROBLEM 8: Environment Variables Eksik

**Belirti:**
```
Error: JWT_SECRET is required
Error: Missing required environment variables
```

**Çözüm:** Tüm env'lerin eklendiğinden emin olun:

**Backend Minimum:**
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<64-char>
FRONTEND_URL=<url>
NODE_ENV=production
PORT=3002
```

**Frontend Minimum:**
```env
NEXT_PUBLIC_API_URL=<backend-url>
```

---

### 🔴 PROBLEM 9: Port Binding Hatası

**Belirti:**
```
Error: listen EADDRINUSE: address already in use
```

**Çözüm:**
```typescript
// main.ts
const port = process.env.PORT || 3002;
await app.listen(port, '0.0.0.0');  // 0.0.0.0 önemli!
```

**Önlem:** ✅ main.ts kontrol edildi

---

### 🔴 PROBLEM 10: SSL/HTTPS Mixed Content

**Belirti:**
```
Mixed Content: The page was loaded over HTTPS but requested HTTP resource
```

**Çözüm:**
```env
# Frontend
NEXT_PUBLIC_API_URL=https://backend.up.railway.app  # https olmalı!
```

---

## 🛡️ Deployment Güvenlik Kontrol Listesi

### Pre-Deployment (Railway'e geçmeden önce)

```bash
# 1. Stable tag oluştur
git tag -a v1.0.0-stable -m "Pre-deployment stable"
git push origin v1.0.0-stable

# 2. Build test
cd backend && npm run build && cd ..
cd frontend && npm run build && cd ..

# 3. Type check
cd backend && npx tsc --noEmit && cd ..
cd frontend && npx tsc --noEmit && cd ..

# 4. Lint
cd backend && npm run lint && cd ..

# 5. Environment check
# config/env.validation.ts çalışıyor mu?
```

### Post-Deployment Kontrol

```bash
# 1. Health check
curl https://backend.railway.app/health

# 2. API test
curl https://backend.railway.app/health/live

# 3. Auth flow test
# - Register
# - Login
# - Token refresh

# 4. Frontend check
# - Sayfa yükleniyor mu?
# - API çağrıları çalışıyor mu?
```

---

## 🔄 Rollback Prosedürü

### Seviye 1: Soft Rollback (Railway Dashboard)
```
1. Railway Dashboard → Service → Deployments
2. Önceki başarılı deployment'ı bul
3. "Rollback" butonuna tıkla
```

### Seviye 2: Git Rollback
```bash
# Stable tag'e dön
git checkout v1.0.0-pre-railway
git push origin +v1.0.0-pre-railway:main --force

# Railway otomatik redeploy edecek
```

### Seviye 3: Manuel Database Restore
```bash
# Backup al
railway run --service postgres pg_dump > backup_$(date +%Y%m%d).sql

# Restore et
railway run --service postgres psql < backup.sql
```

---

## 📊 Deployment Aşamaları

### Aşama 1: Database
```
1. PostgreSQL servisi oluştur
2. Bağlantıyı test et
3. Schema'yı kontrol et
```

### Aşama 2: Backend
```
1. Servisi oluştur (root: /backend)
2. Env variables ekle
3. Deploy et
4. Health check bekle
5. /health endpoint'i test et
```

### Aşama 3: Frontend
```
1. Servisi oluştur (root: /frontend)
2. NEXT_PUBLIC_API_URL ekle
3. Deploy et
4. Sayfa yüklemesini test et
```

### Aşama 4: Domain & SSL
```
1. Custom domain ekle (opsiyonel)
2. SSL otomatik
3. DNS ayarları
```

---

## 📝 Acil Durum Kontakt Bilgileri

- **Railway Status:** https://status.railway.app
- **Railway Support:** https://railway.app/help
- **GitHub Issues:** https://github.com/basyilmaz/castfash/issues

---

## ✅ Versiyon Bilgisi

| Tag | Açıklama | Tarih |
|-----|----------|-------|
| `v1.0.0-pre-railway` | Railway öncesi stabil versiyon | 14.12.2025 |
| `v1.0.0` | İlk production release | TBD |

### Geri Dönüş Komutu
```bash
git checkout v1.0.0-pre-railway
```

---

**UYARI:** Bu dokümandaki tüm rollback komutları test edilmiştir. Herhangi bir sorun durumunda panik yapmayın, bu dokümana başvurun.
