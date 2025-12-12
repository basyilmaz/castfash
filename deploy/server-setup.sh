#!/bin/bash
# CastFash - Hostinger VPS Server Setup Script
# Ubuntu 24.04 için Docker ve gerekli araçları kurar

set -e

echo "=========================================="
echo "  CastFash Server Setup - Ubuntu 24.04"
echo "=========================================="

# 1. Sistem güncellemesi
echo "[1/6] Sistem güncelleniyor..."
apt update && apt upgrade -y

# 2. Gerekli araçları kur
echo "[2/6] Gerekli araçlar kuruluyor..."
apt install -y curl git wget nano ufw

# 3. Docker kurulumu
echo "[3/6] Docker kuruluyor..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Docker Compose eklentisi
apt install -y docker-compose-plugin

# Docker'ı başlat ve etkinleştir
systemctl start docker
systemctl enable docker

# 4. Firewall ayarları
echo "[4/6] Firewall ayarlanıyor..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Frontend
ufw allow 3002/tcp  # Backend API
ufw --force enable

# 5. Proje dizini oluştur
echo "[5/6] Proje dizini oluşturuluyor..."
mkdir -p /opt/castfash
cd /opt/castfash

# 6. Swap alanı oluştur (düşük RAM için)
echo "[6/6] Swap alanı oluşturuluyor..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "=========================================="
echo "  ✅ Server kurulumu tamamlandı!"
echo "=========================================="
echo ""
echo "Sonraki adım: Projeyi sunucuya yükleyin"
echo "  scp -r ./castfash root@31.220.111.123:/opt/"
echo ""
echo "Veya Git ile:"
echo "  cd /opt/castfash"
echo "  git clone https://github.com/your-repo/castfash.git ."
echo ""
