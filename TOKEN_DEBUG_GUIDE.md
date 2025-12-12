# 🔍 Token Kaybolma Sorunu - Debug

**Tarih:** 30 Kasım 2025, 00:27  
**Durum:** 🔍 Token localStorage'da yok

---

## ✅ **KOD DOĞRU:**

Token key'i tutarlı:
- `http.ts` → `castfash_access_token` ✅
- `auth.ts` → `castfash_access_token` ✅

Login fonksiyonu token'ı kaydediyor:
```typescript
window.localStorage.setItem("castfash_access_token", res.accessToken);
```

---

## 🐛 **SORUN:**

Token localStorage'a kaydediliyor ama sonra kayboluyor!

**Olası Nedenler:**
1. Login başarısız oluyor (error catch ediliyor)
2. Token kaydediliyor ama sayfa yenileniyor ve siliniyor
3. Başka bir kod token'ı siliyor
4. Browser privacy/incognito mode

---

## 🔧 **DEBUG ADIMLARI:**

### **1. Browser Console'da Token Kontrolü:**
```javascript
// Token var mı?
console.log('Token:', localStorage.getItem('castfash_access_token'));

// Tüm localStorage
console.log('All storage:', {...localStorage});
```

### **2. Login Sonrası Token Kontrolü:**
```javascript
// Login sayfasında console'u aç
// Login yap
// Hemen sonra:
console.log('After login:', localStorage.getItem('castfash_access_token'));
```

### **3. Network Tab'da Login Response:**
```
1. F12 → Network tab
2. Login yap
3. /auth/login request'ine tıkla
4. Response tab → accessToken var mı?
```

---

## ✅ **HIZLI ÇÖZÜM:**

### **Manuel Token Ekleme (Test İçin):**
```javascript
// Browser console'da:
localStorage.setItem('castfash_access_token', 'BURAYA_TOKEN_YAPIŞTIR');

// Token'ı almak için:
// 1. Postman/Insomnia kullan
// 2. POST http://localhost:3002/auth/login
// 3. Body: {"email":"basyilmaz@gmail.com","password":"Yilmaz2154!"}
// 4. Response'daki accessToken'ı kopyala
```

---

## 🔍 **POSTMAN İLE TOKEN ALMA:**

```
POST http://localhost:3002/auth/login
Content-Type: application/json

{
  "email": "basyilmaz@gmail.com",
  "password": "Yilmaz2154!"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "organization": {...},
  "user": {...}
}
```

Token'ı kopyala ve browser console'da:
```javascript
localStorage.setItem('castfash_access_token', 'KOPYALADIĞINIZ_TOKEN');
```

Sonra sayfayı yenileyin!

---

## 📊 **TEST SENARYOSU:**

1. **Browser Console Aç:** F12
2. **localStorage Temizle:**
   ```javascript
   localStorage.clear();
   ```
3. **Login Sayfasına Git:** http://localhost:3003/auth/login
4. **Console'da İzle:**
   ```javascript
   // Login öncesi
   console.log('Before login:', localStorage.getItem('castfash_access_token'));
   ```
5. **Login Yap**
6. **Console'da Kontrol:**
   ```javascript
   // Login sonrası
   console.log('After login:', localStorage.getItem('castfash_access_token'));
   ```
7. **Dashboard'a Git**
8. **Console'da Kontrol:**
   ```javascript
   // Dashboard'da
   console.log('On dashboard:', localStorage.getItem('castfash_access_token'));
   ```

---

## ⚠️ **EĞER TOKEN YOK:**

**Neden:**
- Login başarısız
- Response'da accessToken yok
- localStorage blocked (privacy mode)

**Çözüm:**
- Network tab'da /auth/login response'unu kontrol et
- Console'da error var mı bak
- Postman ile manuel token al ve test et

---

**İlk adım: Browser console'da localStorage kontrol edin!** 🔍

```javascript
console.log(localStorage.getItem('castfash_access_token'));
```
