# CastFash - Environment Variables Documentation

Bu dosya, CastFash uygulamasının tüm environment değişkenlerini detaylı olarak açıklar.

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
3. Use Redis for rate limiting in production (optional BullMQ upgrade)

### Monitoring
1. Consider adding Sentry DSN for error tracking
   ```env
   SENTRY_DSN="https://xxx@sentry.io/xxx"
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

**Last Updated:** December 6, 2025
