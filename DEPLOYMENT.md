# CastFash Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (or use Docker)

---

## Quick Start (Docker)

### 1. Clone and Configure

```bash
# Clone repository
git clone https://github.com/your-org/castfash.git
cd castfash

# Copy environment file
cp .env.production.example .env

# Edit .env with your settings
nano .env
```

### 2. Build and Run

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed default data (optional)
docker-compose exec backend npx prisma db seed
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- API Docs: http://localhost:3002/api/docs

---

## Production Deployment

### Using Nginx (Recommended)

```bash
# Start with production profile (includes Nginx)
docker-compose --profile production up -d
```

### SSL/HTTPS Setup

1. Place SSL certificates in `./ssl/` directory
2. Update `nginx.conf` with SSL configuration
3. Restart Nginx container

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `AI_PROVIDER_KIE_API_KEY` | Yes | KIE.ai API key |
| `EMAIL_HOST` | No | SMTP server for emails |

See `.env.production.example` for full list.

---

## Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

### Load Balancing

Update `nginx.conf` to include upstream configuration for multiple backend instances.

---

## Monitoring

### Health Checks

- Backend: `GET /health`
- Database: PostgreSQL health check in docker-compose

### Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## Backup

### Database Backup

```bash
# Create backup
docker-compose exec db pg_dump -U castfash castfash > backup.sql

# Restore backup
docker-compose exec -i db psql -U castfash castfash < backup.sql
```

### Uploads Backup

```bash
# Backup uploads volume
docker cp castfash_backend:/app/uploads ./uploads-backup
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Backend Issues

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Re-run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Frontend Issues

```bash
# Rebuild frontend
docker-compose build frontend

# Check frontend logs
docker-compose logs frontend
```

---

## Support

For issues or questions, please open a GitHub issue.
