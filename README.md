# 🎨 CastFash

AI-powered fashion catalog visual generation platform.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20+-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)

---

## 📋 Overview

CastFash is an enterprise-grade platform for generating AI-powered fashion product visuals. It enables fashion brands to create professional product images with virtual models and custom backgrounds.

### Key Features

- 🖼️ **AI Image Generation** - Generate product visuals with multiple AI providers
- 👤 **Virtual Models** - Custom model profiles with face references
- 🎭 **Scene Presets** - Pre-configured backgrounds and environments
- 📊 **Queue System** - Async generation with job tracking
- 💳 **Credit Management** - Token-based usage tracking
- 🔐 **Multi-tenant** - Organization-based access control
- 📈 **Admin Dashboard** - Real-time monitoring and analytics

---

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Rate Limiting**: Multi-tier throttling
- **Logging**: Structured JSON logs

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: React hooks + Context
- **UI**: Custom component library

### DevOps
- **Containers**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Reverse Proxy**: Nginx

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm or pnpm

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd castfash

# Start database
cd backend
docker-compose up -d

# Install backend
npm install
cp .env.example .env  # Configure your environment
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Install frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **API Docs**: http://localhost:3002/api

---

## 🐳 Docker Deployment

```bash
# Configure environment
cp .env.example .env
# Edit .env with your values

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## 📁 Project Structure

```
castfash/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── common/         # Shared utilities
│   │   ├── ai-image/       # AI provider integrations
│   │   └── prisma/         # Database configuration
│   ├── prisma/             # Database schema & migrations
│   └── Dockerfile
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── Dockerfile
├── postman/               # API collection
├── scripts/               # Utility scripts
├── docker-compose.yml     # Production compose
└── nginx.conf            # Reverse proxy config
```

---

## 🔌 API Endpoints

### Authentication
```http
POST /auth/signup
POST /auth/login
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
```

### Products & Generation
```http
GET  /products
POST /products/:id/generate
GET  /generations
GET  /generation-requests
```

### Admin
```http
GET  /system-admin/queue/stats
GET  /system-admin/providers/health
GET  /system-admin/logs
```

See [Postman Collection](./postman/) for complete API documentation.

---

## ⚙️ Configuration

All configuration is done via environment variables. See [ENV_DOCUMENTATION.md](./ENV_DOCUMENTATION.md) for complete reference.

### Essential Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `FRONTEND_URL` | Frontend URL for email links |
| `EMAIL_*` | SMTP configuration |
| `AI_PROVIDER_*` | AI provider API keys |

---

## 🔒 Security Features

- ✅ JWT Authentication (Access + Refresh)
- ✅ Password Reset via Email
- ✅ Email Verification
- ✅ Multi-tier Rate Limiting
- ✅ Brute Force Protection
- ✅ Request Logging & Audit Trail
- ✅ CORS Configuration
- ✅ Security Headers (via Nginx)

---

## 📊 Admin Dashboard

Access at `/system-admin` (requires super admin role)

- **Dashboard** - System overview
- **Users** - User management
- **Organizations** - Tenant management
- **Queue** - Job monitoring
- **Logs** - Real-time log viewer
- **Providers** - AI provider health

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# API endpoint tests
./scripts/test-api.sh

# Or use Postman collection
```

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For issues and feature requests, please use GitHub Issues.

---

**Last Updated:** December 2025
