# 🔧 Push Notification Troubleshooting Guide

## 🎯 Masalah Shared Hosting CPanel

Push notification bekerja sempurna di localhost tapi gagal di CPanel shared hosting? Ini panduan lengkap untuk debugging dan solusinya.

## 🔍 Langkah Debugging

### 1. Jalankan Debug Tools

1. Buka website di production: `https://yourdomain.com/test-push`
2. Klik tombol **"Debug Info"**
3. Buka **Developer Console** (F12 → Console tab)
4. Lihat output debug yang akan menampilkan:
   - ✅/❌ HTTPS Status
   - ✅/❌ Service Worker Support
   - ✅/❌ Push API Support
   - ✅/❌ Notification Permission
   - ✅/❌ Service Worker Registration
   - ✅/❌ VAPID Keys
   - ✅/❌ Push Subscription

### 2. Masalah Umum CPanel Shared Hosting

#### A. Service Worker Tidak Ter-register
**Gejala:** Console error `Failed to register service worker`

**Penyebab:**
- File service worker tidak accessible
- MIME type salah untuk `.js` files
- Path service worker salah

**Solusi:**
```bash
# Pastikan file ini ada dan accessible:
public/sw.js
public/swe-worker-ab00d3c7d2d59769.js

# Cek di browser: https://yourdomain.com/sw.js
# Harus return JavaScript, bukan 404
```

#### B. HTTPS Issues
**Gejala:** Push API tidak available

**Penyebab:** 
- SSL tidak aktif
- Mixed content (HTTP resources di HTTPS site)

**Solusi:**
- Aktifkan SSL di CPanel
- Force HTTPS redirect
- Pastikan semua resources menggunakan HTTPS

#### C. Environment Variables Tidak Terbaca
**Gejala:** VAPID keys undefined di server

**Penyebab:**
- `.env.local` tidak ter-upload
- CPanel tidak support environment variables
- Build tidak include environment variables

**Solusi:**
```bash
# Option 1: Hardcode di next.config.ts (TIDAK AMAN untuk production)
module.exports = {
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'your-vapid-public-key',
    VAPID_PRIVATE_KEY: 'your-vapid-private-key',
    VAPID_EMAIL: 'your-email@domain.com'
  }
}

# Option 2: Upload .env.local ke root folder
# Option 3: Set via CPanel environment variables (jika support)
```

#### D. Database Connection Issues
**Gejala:** Subscription tidak tersimpan

**Penyebab:**
- Supabase URL/Key tidak terbaca
- Network firewall blocking

**Solusi:**
- Pastikan environment variables Supabase ter-set
- Test koneksi database dari production

### 3. Static Export Issues

Jika menggunakan `next export` untuk static deployment:

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

**PERINGATAN:** Static export TIDAK SUPPORT:
- Server Actions
- API Routes
- Dynamic features

**Solusi:** Gunakan server deployment atau pindah ke Vercel/Netlify.

## 🛠 Debugging Checklist

Jalankan checklist ini di production:

- [ ] **HTTPS aktif** (`https://` di URL)
- [ ] **Service Worker accessible** (buka `https://yourdomain.com/sw.js`)
- [ ] **Environment variables ter-set** (check debug console)
- [ ] **Database connection working** (test di `/test-push`)
- [ ] **No console errors** (F12 → Console tab)
- [ ] **Notification permission granted** (browser icon di address bar)

## 📋 Common CPanel Limitations

### Yang TIDAK BISA di Shared Hosting:
1. **Node.js runtime** → Server Actions gagal
2. **WebSocket connections** → Real-time features terbatas
3. **Custom server configuration** → Service Worker config terbatas
4. **Environment variables** → Harus hardcode atau manual upload

### Yang BISA di Shared Hosting:
1. **Static PWA** dengan client-side only
2. **Service Worker** untuk caching
3. **Push Subscription** (client-side)
4. **External API calls** via fetch

## 🔄 Alternative Solutions

### Option 1: Client-Only Push (Terbatas)
```typescript
// Hanya bisa send notification ke user yang sedang online
if ('serviceWorker' in navigator && 'Notification' in window) {
  // Show notification directly tanpa server
  new Notification('Title', {
    body: 'Message',
    icon: '/logo-asset-white.svg'
  })
}
```

### Option 2: Third-Party Services
- **OneSignal** - Free push notification service
- **Firebase Cloud Messaging** - Google's push service
- **Pusher** - Real-time communication platform

### Option 3: Upgrade Hosting
- **VPS/Dedicated Server** dengan Node.js support
- **Vercel/Netlify** - Serverless deployment
- **Railway/Render** - Container deployment

## 🚀 Quick Fix untuk CPanel

Jika mau quick fix untuk CPanel shared hosting:

1. **Upload semua files** termasuk `.env.local`
2. **Set MIME type** untuk `.js` files = `text/javascript`
3. **Force HTTPS** via `.htaccess`
4. **Test service worker** manual: `https://yourdomain.com/sw.js`

Kalau masih gagal, kemungkinan besar CPanel shared hosting tidak support fitur yang dibutuhkan untuk push notifications.

## 📞 Next Steps

Setelah jalankan debug tools, share hasil console log nya untuk analisis lebih lanjut!
