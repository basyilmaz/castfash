# CastFash - Environment Variables Documentation

**Brand:** CastinTech  
**Project:** CastFash - AI Fashion Visuals Platform  
**Last Updated:** December 13, 2025

Bu dosya, CastFash uygulamasının tüm environment değişkenlerini detaylı olarak açıklar.

---

## 📋 İçindekiler

1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Railway Deployment](#railway-deployment)
4. [Docker Compose Environment](#docker-compose-environment)
5. [Production Recommendations](#production-recommendations)

---

## Backend Environment Variables

### Database
```env
# PostgreSQL bağlantı dizesi
DATABASE_URL="postgresql://user:password@localhost:5432/castfash?schema=public"
```

### JWT & Authentication
```env
# JWT secret key (en az 32 karakter, rastgele oluşturulmalı)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# JWT access token süresi (örn: 15m, 1h, 1d)
JWT_ACCESS_EXPIRES="1h"

# JWT refresh token süresi
JWT_REFRESH_EXPIRES="7d"
```

### Email Configuration (SMTP)
```env
# SMTP sunucu adresi
EMAIL_HOST="smtp.gmail.com"

# SMTP port (587 for TLS, 465 for SSL, 25 for plain)
EMAIL_PORT=587

# SSL kullanımı (true/false)
EMAIL_SECURE=false

# SMTP kullanıcı adı
EMAIL_USER="your-email@gmail.com"

# SMTP şifresi veya uygulama şifresi
EMAIL_PASSWORD="your-app-password"

# Gönderen e-posta adresi
EMAIL_FROM="CastFash <noreply@castfash.com>"
```

### Frontend URL (Email linkleri için)
```env
# Frontend URL (password reset linkleri için)
FRONTEND_URL="http://localhost:3000"
```

### AI Provider Configuration
```env
# KIE AI Provider
AI_PROVIDER_KIE_ENABLED=true
AI_PROVIDER_KIE_API_KEY="your-kie-api-key"
AI_PROVIDER_KIE_BASE_URL="https://api.kie.ai"

# Replicate AI Provider
AI_PROVIDER_REPLICATE_ENABLED=false
AI_PROVIDER_REPLICATE_API_KEY="your-replicate-api-key"

# FAL AI Provider
AI_PROVIDER_FAL_ENABLED=false
AI_PROVIDER_FAL_API_KEY="your-fal-api-key"
```

### Server Configuration
```env
# Backend port
PORT=3002

# Node environment (development, production, test)
NODE_ENV="development"

# Log level (error, warn, info, debug, verbose)
LOG_LEVEL="debug"
```

### Rate Limiting (Optional - defaults provided)
```env
# Rate limit - requests per minute
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

---

## Frontend Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3002"

# App name (optional)
NEXT_PUBLIC_APP_NAME="CastFash"
```

---

## 🚂 Railway Deployment

### Railway Project Setup

Railway'de 3 servis oluşturmanız gerekiyor:

1. **PostgreSQL Database** (Railway managed)
2. **Backend API** (from GitHub)
3. **Frontend** (from GitHub)

### Railway Backend Environment Variables

Railway Dashboard → Backend Service → Variables:

```env
# Database (Railway otomatik sağlar)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (Generate secure secret)
JWT_SECRET="your-64-char-random-string-here-use-crypto-randomBytes"
JWT_ACCESS_EXPIRES="1h"
JWT_REFRESH_EXPIRES="7d"

# Frontend URL (Railway frontend URL)
FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="CastFash <noreply@castfash.com>"

# AI Providers
AI_PROVIDER_KIE_ENABLED=true
AI_PROVIDER_KIE_API_KEY="your-kie-api-key"
AI_PROVIDER_REPLICATE_ENABLED=false
AI_PROVIDER_FAL_ENABLED=false

# Server
PORT=3002
NODE_ENV=production
LOG_LEVEL=info
```

### Railway Frontend Environment Variables

Railway Dashboard → Frontend Service → Variables:

```env
# Backend API URL (Railway backend URL)
NEXT_PUBLIC_API_URL=${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

### Railway Service Configuration

#### Backend Service
- **Root Directory:** `backend`
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && npm run start:prod`
- **Health Check Path:** `/health`

#### Frontend Service
- **Root Directory:** `frontend`
- **Build Command:** `npm ci && npm run build`
- **Start Command:** `npm run start`
- **Port:** 3000

### Railway CLI Commands

```bash
# Login to Railway
railway login

# Link to project
railway link

# Deploy manually
railway up

# View logs
railway logs

# Open dashboard
railway open
```

### Railway Reference Variables

Railway'in otomatik sağladığı değişkenler:

| Variable | Description |
|----------|-------------|
| `${{Postgres.DATABASE_URL}}` | PostgreSQL connection string |
| `${{service.RAILWAY_PUBLIC_DOMAIN}}` | Service public URL |
| `${{service.PORT}}` | Service port |
| `RAILWAY_ENVIRONMENT` | Current environment (production/staging) |

---

## Example .env Files

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/castfash?schema=public"

# JWT
JWT_SECRET="change-this-to-a-very-long-random-string-at-least-32-chars"
JWT_ACCESS_EXPIRES="1h"
JWT_REFRESH_EXPIRES="7d"

# Email (Gmail example)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=""
EMAIL_PASSWORD=""
EMAIL_FROM="CastFash <noreply@castfash.com>"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# AI Providers
AI_PROVIDER_KIE_ENABLED=true
AI_PROVIDER_KIE_API_KEY=""
AI_PROVIDER_REPLICATE_ENABLED=false
AI_PROVIDER_FAL_ENABLED=false

# Server
PORT=3002
NODE_ENV="development"
LOG_LEVEL="debug"
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
```

---

## Docker Compose Environment

For Docker deployments, create a `.env` file in the project root:

```env
# PostgreSQL
POSTGRES_USER=castfash
POSTGRES_PASSWORD=secure-password
POSTGRES_DB=castfash

# Backend
DATABASE_URL=postgresql://castfash:secure-password@db:5432/castfash?schema=public
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com

# Frontend
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

---

## Production Recommendations

### Security
1. **JWT_SECRET**: Use a cryptographically secure random string (256-bit minimum)
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **DATABASE_URL**: Use SSL connection in production
   ```
   postgresql://user:password@host:5432/db?schema=public&sslmode=require
   ```

3. **Email**: Use dedicated transactional email service (SendGrid, Mailgun, AWS SES)

### Performance
1. Set `NODE_ENV=production`
2. Set `LOG_LEVEL=info` or `warn` in production
3. Use Redis for caching and rate limiting (future enhancement)

### Monitoring
1. Consider adding Sentry DSN for error tracking
   ```env
   SENTRY_DSN="https://xxx@sentry.io/xxx"
   ```

---

## Quick Reference Table

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | ✅ | - | PostgreSQL connection string |
| JWT_SECRET | ✅ | - | JWT signing secret |
| JWT_ACCESS_EXPIRES | ❌ | 1h | Access token expiry |
| JWT_REFRESH_EXPIRES | ❌ | 7d | Refresh token expiry |
| PORT | ❌ | 3002 | Backend server port |
| NODE_ENV | ❌ | development | Node environment |
| FRONTEND_URL | ✅ | - | Frontend URL for emails |
| EMAIL_HOST | ✅ | - | SMTP server |
| EMAIL_PORT | ❌ | 587 | SMTP port |
| AI_PROVIDER_KIE_ENABLED | ❌ | true | Enable KIE provider |
| AI_PROVIDER_KIE_API_KEY | ⚠️ | - | KIE API key (if enabled) |
| NEXT_PUBLIC_API_URL | ✅ | - | Backend API URL |

---

**Maintained by:** CastinTech  
**Project:** CastFash

