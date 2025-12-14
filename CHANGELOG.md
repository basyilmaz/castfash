# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Versioning system implementation
- Railway deployment configuration
- Comprehensive task list

### Changed
- Updated package.json files with CastinTech branding
- Configured workspace structure

---

## [0.1.0] - 2025-12-13

### Added

#### Core Features
- AI-powered image generation with multiple providers (KIE, Replicate, FAL)
- Product management with categories and variants
- Model profile system with customizable attributes
- Scene presets and scene packs
- Credit-based usage system
- Multi-organization (multi-tenant) architecture

#### Authentication & Security
- JWT authentication with access and refresh tokens
- Password reset via email
- Email verification system
- Rate limiting with @nestjs/throttler
- CORS configuration

#### Admin Panel
- Super Admin dashboard with system metrics
- User management
- Organization management with credit adjustment
- AI provider configuration and priority management
- Audit logging system
- Queue monitoring
- Prompt template and preset management

#### Frontend
- Next.js 16 with App Router
- Tailwind CSS 4 styling
- Dark theme with glass morphism design
- Responsive layout
- Marketing pages (landing, pricing, about, contact, blog, FAQ)
- Turkish and English language support (i18n)

#### Backend
- NestJS 11 framework
- Prisma ORM with PostgreSQL
- 24 database models
- RESTful API endpoints
- Swagger API documentation
- Health check endpoints
- Nodemailer email integration

#### DevOps
- Docker and Docker Compose configuration
- GitHub Actions CI/CD pipeline
- Nginx reverse proxy configuration

### Technical Stack
- **Backend:** NestJS 11, TypeScript 5.7, Prisma 5.21
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Database:** PostgreSQL 15
- **AI Providers:** KIE, Replicate, FAL

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 0.1.0 | 2025-12-13 | Initial development release |

---

## Upcoming Releases

### [0.2.0] - Planned
- Stripe payment integration
- Real-time WebSocket progress
- BullMQ queue system
- Redis caching

### [0.3.0] - Planned
- Enhanced test coverage
- CDN integration
- Image optimization with Sharp

### [1.0.0] - Production Release
- Full production readiness
- Complete documentation
- >60% test coverage

---

**Maintained by:** CastinTech  
**Project:** CastFash
