#!/bin/bash
# CastFash - Production Deploy Script
# Bu script sunucuda /opt/castfash dizininde çalıştırılır

set -e

echo "=========================================="
echo "  CastFash Production Deployment"
echo "=========================================="

cd /opt/castfash

# 1. Environment dosyasını kontrol et
if [ ! -f .env ]; then
    echo "❌ HATA: .env dosyası bulunamadı!"
    echo "Lütfen .env.production dosyasını .env olarak kopyalayın ve düzenleyin:"
    echo "  cp .env.production .env"
    echo "  nano .env"
    exit 1
fi

# 2. Eski container'ları durdur
echo "[1/5] Eski container'lar durduruluyor..."
docker compose down 2>/dev/null || true

# 3. Yeni image'ları build et
echo "[2/5] Docker image'ları build ediliyor..."
docker compose build --no-cache

# 4. Container'ları başlat
echo "[3/5] Container'lar başlatılıyor..."
docker compose up -d

# 5. Database migration
echo "[4/5] Database migration çalıştırılıyor..."
sleep 10  # Database'in hazır olmasını bekle
docker compose exec -T backend npx prisma migrate deploy

# 6. Health check
echo "[5/5] Sağlık kontrolü yapılıyor..."
sleep 5

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

echo ""
echo "=========================================="
echo "  Deployment Sonuçları"
echo "=========================================="
echo ""

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "503" ]; then
    echo "✅ Backend API:  http://31.220.111.123:3002"
else
    echo "❌ Backend API:  Başarısız (Status: $BACKEND_STATUS)"
fi

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend:     http://31.220.111.123:3000"
else
    echo "❌ Frontend:     Başarısız (Status: $FRONTEND_STATUS)"
fi

echo ""
echo "📚 API Docs:     http://31.220.111.123:3002/api/docs"
echo ""
echo "Container durumları:"
docker compose ps
echo ""
echo "Logları görmek için: docker compose logs -f"
echo ""
