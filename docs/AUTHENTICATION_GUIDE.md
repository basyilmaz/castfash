# 🔐 CastFash Authentication Guide

Bu rehber, CastFash API'si ile kimlik doğrulama işlemlerinin nasıl yapılacağını açıklar.

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kayıt (Sign Up)](#kayıt-sign-up)
3. [Giriş (Login)](#giriş-login)
4. [Token Yenileme](#token-yenileme)
5. [Şifre Sıfırlama](#şifre-sıfırlama)
6. [E-posta Doğrulama](#e-posta-doğrulama)
7. [Korumalı Endpoint'lere Erişim](#korumalı-endpointlere-erişim)
8. [Hata Kodları](#hata-kodları)

---

## 🔍 Genel Bakış

CastFash, JWT (JSON Web Token) tabanlı kimlik doğrulama kullanır.

### Token Türleri

| Token Türü | Süre | Kullanım |
|------------|------|----------|
| Access Token | 15 dakika | API istekleri |
| Refresh Token | 7 gün | Access token yenileme |

### Base URL

```
Production: https://api.castfash.com
Development: http://localhost:4000
```

---

## 📝 Kayıt (Sign Up)

Yeni kullanıcı hesabı oluşturma.

### Endpoint

```
POST /auth/signup
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "organizationName": "My Company"
}
```

### Başarılı Response (201)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isEmailVerified": false
  },
  "organization": {
    "id": 1,
    "name": "My Company",
    "remainingCredits": 20
  }
}
```

### Örnek cURL

```bash
curl -X POST https://api.castfash.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "organizationName": "My Company"
  }'
```

---

## 🔑 Giriş (Login)

Mevcut hesap ile giriş yapma.

### Endpoint

```
POST /auth/login
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Başarılı Response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "isEmailVerified": true,
    "isSuperAdmin": false
  },
  "organization": {
    "id": 1,
    "name": "My Company",
    "remainingCredits": 150
  }
}
```

### Örnek cURL

```bash
curl -X POST https://api.castfash.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## 🔄 Token Yenileme

Access token süresi dolduğunda yeni token alma.

### Endpoint

```
POST /auth/refresh
```

### Request Body

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Başarılı Response (200)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Best Practices

1. Access token'ın süresi dolmadan önce yenileyin
2. Refresh token'ı güvenli bir şekilde saklayın (HttpOnly cookie önerilir)
3. Token yenileme başarısız olursa kullanıcıyı logout yapın

---

## 🔒 Şifre Sıfırlama

### Adım 1: Sıfırlama İsteği

```
POST /auth/forgot-password
```

```json
{
  "email": "user@example.com"
}
```

### Adım 2: Şifre Belirleme

```
POST /auth/reset-password
```

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

---

## ✉️ E-posta Doğrulama

### E-posta Doğrulama

```
POST /auth/verify-email
```

```json
{
  "token": "verification-token-from-email"
}
```

### Doğrulama E-postası Yeniden Gönderme

```
POST /auth/resend-verification
```

```json
{
  "email": "user@example.com"
}
```

---

## 🛡️ Korumalı Endpoint'lere Erişim

Kimlik doğrulama gerektiren endpoint'lere erişmek için Access Token'ı `Authorization` header'ına ekleyin.

### Header Format

```
Authorization: Bearer <access_token>
```

### Örnek Request

```bash
curl -X GET https://api.castfash.com/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript/TypeScript Örneği

```typescript
const response = await fetch('https://api.castfash.com/products', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

## ⚠️ Hata Kodları

| Kod | Mesaj | Açıklama |
|-----|-------|----------|
| 400 | Bad Request | Geçersiz istek formatı |
| 401 | Unauthorized | Geçersiz veya eksik token |
| 403 | Forbidden | Yetkisiz erişim |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | E-posta zaten kullanımda |
| 429 | Too Many Requests | Rate limit aşıldı |

### Hata Response Formatı

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

---

## 🔧 Rate Limiting

API, brute-force saldırılarını önlemek için rate limiting uygular:

| Endpoint | Limit |
|----------|-------|
| /auth/login | 10 istek/dakika |
| /auth/signup | 5 istek/dakika |
| /auth/forgot-password | 3 istek/dakika |
| Diğer | 100 istek/dakika |

Rate limit aşıldığında `429 Too Many Requests` hatası döner.

---

## 📱 Frontend Entegrasyonu

### Token Saklama

```typescript
// Login sonrası
localStorage.setItem('accessToken', response.accessToken);
// veya daha güvenli: HttpOnly cookie kullanın
```

### Axios Interceptor Örneği

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Request interceptor - Token ekleme
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/auth/refresh', { token: refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          error.config.headers.Authorization = `Bearer ${data.accessToken}`;
          return api.request(error.config);
        } catch {
          // Refresh failed - logout
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Güvenlik Önerileri

1. **HTTPS Kullanın**: Tüm API istekleri HTTPS üzerinden yapılmalı
2. **Token Güvenliği**: Access token'ları memory'de, refresh token'ları HttpOnly cookie'de saklayın
3. **Token Süresi**: Access token süresini kısa tutun (15 dk önerilir)
4. **Güçlü Şifre**: Minimum 8 karakter, büyük/küçük harf, rakam, özel karakter
5. **Rate Limiting**: Brute-force koruması için rate limiting aktif

---

*Bu rehber CastFash API v1.0 için hazırlanmıştır.*
