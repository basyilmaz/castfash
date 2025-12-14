# Railway Deployment Guide

**Brand:** CastinTech  
**Project:** CastFash - AI Fashion Visuals Platform  
**Last Updated:** December 13, 2025

---

## 📋 İçindekiler

1. [Railway Proje Kurulumu](#railway-proje-kurulumu)
2. [Servis Yapılandırması](#servis-yapılandırması)
3. [Environment Variables](#environment-variables)
4. [GitHub Integration](#github-integration)
5. [Domain Yapılandırması](#domain-yapılandırması)
6. [Monitoring & Logs](#monitoring--logs)
7. [Troubleshooting](#troubleshooting)

---

## 🚂 Railway Proje Kurulumu

### 1. Railway Hesabı ve Proje

1. [Railway.app](https://railway.app) adresine gidin
2. GitHub ile giriş yapın
3. "New Project" tıklayın
4. "Deploy from GitHub repo" seçin
5. `castintech/castfash` repository'sini seçin

### 2. Servis Ekleme

Railway projesinde 3 servis oluşturun:

| Servis | Tip | Root Directory |
|--------|-----|----------------|
| **PostgreSQL** | Database | - (managed) |
| **Backend** | Web Service | `/backend` |
| **Frontend** | Web Service | `/frontend` |

---

## ⚙️ Servis Yapılandırması

### PostgreSQL Database

1. "Add New" → "Database" → "PostgreSQL"
2. Otomatik olarak oluşturulur
3. `DATABASE_URL` environment variable olarak kullanılabilir

### Backend Service

**Settings → General:**
- **Name:** `castfash-backend`
- **Root Directory:** `backend`

**Settings → Build:**
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Watch Paths:** `/backend/**`

**Settings → Deploy:**
- **Start Command:** `npx prisma migrate deploy && npm run start:prod`
- **Health Check Path:** `/health`
- **Health Check Timeout:** 30s

### Frontend Service

**Settings → General:**
- **Name:** `castfash-frontend`
- **Root Directory:** `frontend`

**Settings → Build:**
- **Build Command:** `npm ci && npm run build`
- **Watch Paths:** `/frontend/**`

**Settings → Deploy:**
- **Start Command:** `npm run start`
- **Port:** 3000

---

## 🔐 Environment Variables

### Backend Variables

Railway Dashboard → `castfash-backend` → Variables:

```env
# Database (Railway reference)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Configuration
JWT_SECRET=<generate-64-char-random-string>
JWT_ACCESS_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d

# Frontend URL
FRONTEND_URL=https://<frontend-domain>.up.railway.app

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
EMAIL_FROM=CastFash <noreply@castfash.com>

# AI Providers
AI_PROVIDER_KIE_ENABLED=true
AI_PROVIDER_KIE_API_KEY=<your-kie-api-key>
AI_PROVIDER_REPLICATE_ENABLED=false
AI_PROVIDER_FAL_ENABLED=false

# Server
PORT=3002
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend Variables

Railway Dashboard → `castfash-frontend` → Variables:

```env
NEXT_PUBLIC_API_URL=https://<backend-domain>.up.railway.app
```

### JWT Secret Oluşturma

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔗 GitHub Integration

### Auto-Deploy Ayarları

Railway Dashboard → Settings → Deployments:

- **Auto-Deploy:** Enabled
- **Production Branch:** `main`
- **Staging Branch:** `develop` (ayrı proje olarak)

### GitHub Secrets (CI/CD için)

GitHub Repository → Settings → Secrets → Actions:

| Secret Name | Description |
|-------------|-------------|
| `RAILWAY_TOKEN_PRODUCTION` | Railway API token (production project) |
| `RAILWAY_TOKEN_STAGING` | Railway API token (staging project) |

### Railway Token Alma

```bash
# Railway CLI ile login
railway login

# Token görüntüleme
railway whoami
```

Veya Railway Dashboard → Account Settings → Tokens

---

## 🌐 Domain Yapılandırması

### Railway Domains

1. Service → Settings → Networking → Domains
2. "Generate Domain" ile `*.up.railway.app` subdomain al
3. Veya "Custom Domain" ile kendi domain'inizi ekleyin

### Custom Domain Ekleme

1. Railway Dashboard → Service → Settings → Domains
2. "Add Custom Domain" tıklayın
3. DNS'e CNAME kaydı ekleyin:
   - **Backend:** `api.castfash.com` → `<backend>.up.railway.app`
   - **Frontend:** `castfash.com` → `<frontend>.up.railway.app`

### SSL/HTTPS

Railway otomatik olarak Let's Encrypt SSL sertifikası sağlar.

---

## 📊 Monitoring & Logs

### Logs Görüntüleme

```bash
# Railway CLI
railway logs --service backend
railway logs --service frontend

# Canlı takip
railway logs --service backend --tail
```

### Dashboard'dan

Railway Dashboard → Service → Deployments → Logs

### Metrics

Railway Dashboard → Service → Metrics:
- CPU Usage
- Memory Usage
- Network I/O

---

## 🛠️ Troubleshooting

### Sık Karşılaşılan Sorunlar

#### 1. Build Hatası

```
Error: Cannot find module 'xxx'
```

**Çözüm:** `package-lock.json` dosyasının güncel olduğundan emin olun:
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "chore: update package-lock"
git push
```

#### 2. Prisma Migration Hatası

```
Error: P3009: migrate found failed migrations
```

**Çözüm:** Railway console'dan migration reset:
```bash
railway run --service backend npx prisma migrate reset --force
```

#### 3. Health Check Başarısız

```
Error: Health check failed
```

**Çözüm:** 
1. `/health` endpoint'inin çalıştığından emin olun
2. Health check timeout süresini artırın (30s → 60s)
3. Start command'ın doğru olduğunu kontrol edin

#### 4. Out of Memory

```
Error: JavaScript heap out of memory
```

**Çözüm:** Build command'a memory flag ekleyin:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Deployment Rollback

```bash
# CLI ile
railway down
railway up --previous

# Dashboard'dan
Deployments → Önceki deployment → "Rollback"
```

### Veritabanı Backup

```bash
# PostgreSQL dump
railway run --service postgres pg_dump -U postgres > backup.sql

# Restore
railway run --service postgres psql -U postgres < backup.sql
```

---

## 📝 Checklist

### İlk Deployment Öncesi

- [ ] PostgreSQL servisi oluşturuldu
- [ ] Backend servisi oluşturuldu ve root directory ayarlandı
- [ ] Frontend servisi oluşturuldu ve root directory ayarlandı
- [ ] Tüm environment variables tanımlandı
- [ ] JWT_SECRET güvenli şekilde oluşturuldu
- [ ] AI provider API key'leri eklendi
- [ ] SMTP ayarları yapılandırıldı

### Deployment Sonrası

- [ ] Backend health check çalışıyor (`/health`)
- [ ] Frontend yükleniyor
- [ ] Login/signup çalışıyor
- [ ] Email gönderimi çalışıyor (password reset test)
- [ ] AI generation çalışıyor

---

## 🔗 Faydalı Linkler

- [Railway Docs](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Nixpacks Docs](https://nixpacks.com/docs)
- [CastFash GitHub](https://github.com/castintech/castfash)

---

**Maintained by:** CastinTech  
**Project:** CastFash
