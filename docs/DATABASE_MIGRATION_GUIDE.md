# 🗄️ CastFash Database Migration Guide

Bu rehber, CastFash veritabanı migration işlemlerinin nasıl yapılacağını açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [İlk Kurulum](#ilk-kurulum)
3. [Migration Oluşturma](#migration-oluşturma)
4. [Migration Çalıştırma](#migration-çalıştırma)
5. [Production Migration](#production-migration)
6. [Rollback İşlemleri](#rollback-işlemleri)
7. [Seed Data](#seed-data)
8. [Troubleshooting](#troubleshooting)

---

## 🔍 Genel Bakış

CastFash, veritabanı yönetimi için **Prisma ORM** kullanır.

### Teknoloji Stack

| Bileşen | Teknoloji |
|---------|-----------|
| ORM | Prisma |
| Database | PostgreSQL |
| Migration Tool | Prisma Migrate |

### Önemli Dosyalar

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema tanımları
│   ├── migrations/        # Migration dosyaları
│   └── seed.ts            # Seed data scripti
└── .env                   # Database URL
```

---

## 🚀 İlk Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
cd backend
npm install
```

### 2. Environment Değişkenlerini Ayarlayın

`.env` dosyasında `DATABASE_URL` tanımlayın:

```env
# Development
DATABASE_URL="postgresql://user:password@localhost:5432/castfash_dev"

# Production
DATABASE_URL="postgresql://user:password@your-host:5432/castfash_prod"
```

### 3. İlk Migration'ı Çalıştırın

```bash
# Tüm migration'ları uygula
npx prisma migrate deploy

# veya development için
npx prisma migrate dev
```

### 4. Prisma Client'ı Generate Edin

```bash
npx prisma generate
```

---

## 📝 Migration Oluşturma

### Yeni Migration Oluşturma

Schema değişikliği yaptıktan sonra:

```bash
npx prisma migrate dev --name migration_name
```

### Örnek: Yeni Tablo Ekleme

1. `schema.prisma`'ya model ekleyin:

```prisma
model NewFeature {
  id        Int      @id @default(autoincrement())
  name      String
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. Migration oluşturun:

```bash
npx prisma migrate dev --name add_new_feature_table
```

### Örnek: Mevcut Tabloya Alan Ekleme

```prisma
model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  // Yeni alan
  phoneNumber  String?   // nullable olarak ekliyoruz
}
```

```bash
npx prisma migrate dev --name add_phone_to_user
```

---

## ▶️ Migration Çalıştırma

### Development

```bash
# Migration oluştur ve uygula
npx prisma migrate dev

# Sadece uygula (mevcut migration'ları)
npx prisma migrate deploy

# Database'i sıfırla (DİKKAT: Tüm veri silinir!)
npx prisma migrate reset
```

### Migration Durumunu Kontrol Et

```bash
npx prisma migrate status
```

---

## 🌐 Production Migration

### Railway/Heroku Deployment

1. **Build komutu** olarak migration ekleyin:

```json
// package.json
{
  "scripts": {
    "build": "npx prisma generate && npx prisma migrate deploy && nest build"
  }
}
```

2. **Procfile** ayarlayın:

```
web: node dist/main
release: npx prisma migrate deploy
```

### Manuel Production Migration

```bash
# Production database'e bağlan
DATABASE_URL="production_database_url" npx prisma migrate deploy
```

### Güvenli Migration Adımları

1. **Yedek Alın**
   ```bash
   pg_dump -h host -U user -d database > backup_$(date +%Y%m%d).sql
   ```

2. **Migration'ı Test Ortamında Deneyin**
   ```bash
   DATABASE_URL="staging_url" npx prisma migrate deploy
   ```

3. **Production'a Uygulayın**
   ```bash
   DATABASE_URL="production_url" npx prisma migrate deploy
   ```

---

## ⏪ Rollback İşlemleri

### Son Migration'ı Geri Al

Prisma doğrudan rollback desteklemez. Manuel yöntemler:

### Yöntem 1: Yeni Migration ile Geri Al

```bash
# Değişiklikleri geri alan migration oluştur
npx prisma migrate dev --name revert_previous_changes
```

### Yöntem 2: Database Reset (Development)

```bash
# Tüm migration'ları sil ve yeniden uygula
npx prisma migrate reset
```

### Yöntem 3: Manuel SQL

```sql
-- Son migration'ı _prisma_migrations tablosundan sil
DELETE FROM _prisma_migrations WHERE migration_name = 'migration_to_remove';

-- İlgili değişiklikleri manuel geri al
DROP TABLE IF EXISTS new_table;
ALTER TABLE users DROP COLUMN IF EXISTS new_column;
```

---

## 🌱 Seed Data

### Seed Scripti Çalıştırma

```bash
npx prisma db seed
```

### seed.ts Örneği

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Kategoriler
  const categories = ['T-Shirt', 'Dress', 'Jacket', 'Pants', 'Shoes'];
  for (const name of categories) {
    await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Default AI Provider
  await prisma.globalAiProvider.upsert({
    where: { id: 1 },
    update: {},
    create: {
      provider: 'FAL',
      modelId: 'fal-ai/flux-pro',
      isActive: true,
      priority: 1,
    },
  });

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### package.json'a Seed Ekleyin

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

---

## 🔧 Troubleshooting

### Hata: "Migration failed"

```bash
# Migration durumunu kontrol et
npx prisma migrate status

# Bekleyen migration'ı işaretle
npx prisma migrate resolve --applied "migration_name"
```

### Hata: "Schema drift detected"

```bash
# Baseline oluştur
npx prisma migrate resolve --applied "init"

# veya database'i schema'ya eşitle
npx prisma db push
```

### Hata: "Column already exists"

```bash
# Migration'ı atla
npx prisma migrate resolve --applied "problematic_migration_name"
```

### Database'i Schema'dan Yeniden Oluştur

```bash
# Development için
npx prisma db push --force-reset

# DİKKAT: Tüm veri silinir!
```

### Prisma Client Sorunları

```bash
# Client'ı yeniden oluştur
npx prisma generate

# Cache'i temizle
rm -rf node_modules/.prisma
npm install
npx prisma generate
```

---

## 📊 Migration Best Practices

### ✅ Yapın

1. **Küçük Migration'lar**: Her migration tek bir değişiklik yapsın
2. **Açıklayıcı İsimler**: `add_user_role_column`, `create_orders_table`
3. **Test Edin**: Her migration'ı staging'de test edin
4. **Yedek Alın**: Production migration öncesi backup
5. **Nullable Başlayın**: Yeni kolonları önce nullable ekleyin, sonra populate edin

### ❌ Yapmayın

1. **Direkt Production**: Migration'ları önce test etmeden production'a atmayın
2. **Büyük Migration'lar**: Birden fazla tablo değişikliğini tek migration'da yapmayın
3. **Schema Değiştirme**: Uygulanan migration dosyalarını değiştirmeyin
4. **Force Push**: `db push --force-reset`'i production'da kullanmayın

---

## 📁 Migration Dosya Yapısı

```
prisma/migrations/
├── 20241201000000_init/
│   └── migration.sql
├── 20241210120000_add_audit_logs/
│   └── migration.sql
├── 20241213150000_add_payment_tables/
│   └── migration.sql
└── migration_lock.toml
```

### migration.sql Örneği

```sql
-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
```

---

## 🔗 Faydalı Komutlar

| Komut | Açıklama |
|-------|----------|
| `npx prisma migrate dev` | Development migration |
| `npx prisma migrate deploy` | Production migration |
| `npx prisma migrate status` | Migration durumu |
| `npx prisma migrate reset` | Database sıfırlama |
| `npx prisma db push` | Schema'yı direkt uygula |
| `npx prisma db pull` | Database'den schema oluştur |
| `npx prisma db seed` | Seed data uygula |
| `npx prisma studio` | GUI database yönetimi |
| `npx prisma generate` | Client oluştur |
| `npx prisma format` | Schema formatla |

---

*Bu rehber CastFash Prisma v5.x için hazırlanmıştır.*
