# 🚀 CastFash - Hostinger VPS Deployment Guide

## Sunucu Bilgileri
- **IP:** `31.220.111.123`
- **OS:** Ubuntu 24.04
- **SSH:** `ssh root@31.220.111.123`

---

## 📋 Adım Adım Deployment

### Adım 1: Sunucuya SSH Bağlantısı

Windows PowerShell veya Terminal'den:

```bash
ssh root@31.220.111.123
```

Şifrenizi girin (Hostinger panelinden "Değiştir" butonuyla görebilirsiniz).

---

### Adım 2: Server Setup (Sunucuda çalıştırın)

```bash
# Setup scriptini indir ve çalıştır
curl -fsSL https://raw.githubusercontent.com/your-repo/castfash/main/deploy/server-setup.sh | bash
```

**Veya manuel olarak:**

```bash
# Sistem güncelle
apt update && apt upgrade -y

# Docker kur
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin

# Docker'ı başlat
systemctl start docker
systemctl enable docker

# Firewall ayarla
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 3000/tcp
ufw allow 3002/tcp
ufw --force enable

# Proje dizini oluştur
mkdir -p /opt/castfash
```

---

### Adım 3: Projeyi Sunucuya Yükle

**Seçenek A: SCP ile (Windows'tan)**

PowerShell'den:

```powershell
# Proje klasörüne git
cd C:\YazilimProjeler\castfash

# Sunucuya kopyala
scp -r ./* root@31.220.111.123:/opt/castfash/
```

**Seçenek B: Git ile (Sunucuda)**

```bash
cd /opt/castfash
git clone https://github.com/basyilmaz/castfash.git .
```

---

### Adım 4: Environment Dosyasını Ayarla

```bash
cd /opt/castfash

# Production env dosyasını kopyala
cp deploy/.env.production .env

# Düzenle (isteğe bağlı)
nano .env
```

**ÖNEMLİ:** JWT_SECRET değerini değiştirin!

---

### Adım 5: Deploy Et

```bash
cd /opt/castfash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

---

### Adım 6: Erişim Test Et

Tarayıcınızda açın:

| Servis | URL |
|--------|-----|
| **Frontend** | http://31.220.111.123:3000 |
| **Backend API** | http://31.220.111.123:3002 |
| **API Docs** | http://31.220.111.123:3002/api/docs |

---

## 🔧 Faydalı Komutlar

### Container Durumu
```bash
docker compose ps
```

### Logları Görüntüle
```bash
# Tüm loglar
docker compose logs -f

# Sadece backend
docker compose logs -f backend

# Sadece frontend
docker compose logs -f frontend
```

### Yeniden Başlat
```bash
docker compose restart
```

### Durdur
```bash
docker compose down
```

### Güncelleme (Yeni kod deploy)
```bash
cd /opt/castfash
git pull  # veya scp ile yeni dosyaları yükle
./deploy/deploy.sh
```

---

## 🔐 Güvenlik Önerileri

1. **SSH Şifresini Değiştirin:**
   ```bash
   passwd root
   ```

2. **JWT Secret'ı Değiştirin:**
   `.env` dosyasında `JWT_SECRET` değerini güçlü bir şifre yapın.

3. **Firewall Aktif:**
   Sadece gerekli portlar açık (22, 80, 3000, 3002).

---

## ❓ Sorun Giderme

### Backend başlamıyor
```bash
docker compose logs backend
```

### Database bağlantı hatası
```bash
docker compose restart db
sleep 10
docker compose restart backend
```

### Port kullanımda hatası
```bash
# Hangi process portu kullanıyor?
netstat -tlnp | grep 3000
```

---

## 📞 Destek

Sorun yaşarsanız:
1. `docker compose logs` çıktısını kontrol edin
2. `/opt/castfash/logs` dizinini inceleyin
