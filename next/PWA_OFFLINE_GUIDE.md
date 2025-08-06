# PWA Offline Support - LensFolia

## 📱 Fitur PWA yang Sudah Diimplementasi

### ✅ Yang Sudah Tersedia:
1. **Service Worker** - Caching otomatis untuk halaman dan asset
2. **Offline Mode** - Halaman utama dapat diakses tanpa internet
3. **Install Prompt** - Users bisa install app ke home screen
4. **Offline Indicator** - Notifikasi visual saat offline
5. **Offline Page** - Halaman khusus saat koneksi terputus
6. **Manifest PWA** - Konfigurasi lengkap untuk installable app

### 🚀 Cara Menguji Offline Functionality

#### 1. **Test di Browser (Chrome Developer Tools)**
```bash
1. Buka aplikasi di http://localhost:3001
2. Tekan F12 untuk membuka Developer Tools
3. Pergi ke tab "Application" > "Service Workers"
4. Pastikan service worker sudah terdaftar
5. Pergi ke tab "Network" 
6. Centang "Offline" checkbox
7. Refresh halaman - halaman tetap bisa diakses!
```

#### 2. **Test Install PWA**
```bash
1. Buka Chrome/Edge
2. Kunjungi http://localhost:3001
3. Akan muncul install prompt di pojok kanan bawah
4. Klik "Install App" 
5. App akan terinstall ke desktop/home screen
```

#### 3. **Test di Mobile Device**
```bash
1. Akses website dari mobile browser
2. Akan muncul browser prompt untuk "Add to Home Screen"
3. Setelah diinstall, app bisa berjalan offline untuk halaman yang sudah di-cache
```

## 🔧 Cara Kerja Service Worker

### Asset yang Di-cache:
- `/` (halaman utama)
- `/encyclopedia` (halaman encyclopedia)
- `/offline` (halaman offline)
- Static files: CSS, JS, images
- Manifest dan favicon

### Strategi Caching:
- **Network First untuk Pages**: Coba fetch dari network dulu, jika gagal gunakan cache
- **Cache First untuk Assets**: CSS, JS, dan images di-serve dari cache terlebih dahulu
- **Dynamic Caching**: Halaman yang dikunjungi otomatis di-cache
- **Fallback to Offline**: Jika cache dan network gagal, tampilkan halaman offline
- **Auto Update**: Service worker otomatis update ketika ada versi baru

## 📁 File-file yang Terkait:

```
public/
  └── sw.js                    # Service Worker utama
  
app/
  ├── manifest.ts              # PWA Manifest configuration
  ├── offline/page.tsx         # Halaman offline
  └── layout.tsx              # Layout dengan OfflineIndicator

components/
  ├── OfflineIndicator.tsx     # Komponen notifikasi offline
  └── InstallPWA.tsx          # Komponen install prompt

hooks/
  └── useServiceWorker.ts      # Custom hook untuk service worker
```

## 🛠 Customization

### Tambah Halaman ke Cache:
Edit `public/sw.js`, tambahkan URL ke array `urlsToCache`:
```javascript
const urlsToCache = [
  '/',
  '/encyclopedia',
  '/offline',
  '/about',        // 👈 Tambah halaman baru
  '/forum',        // 👈 Tambah halaman baru
];
```

### Ubah Strategi Caching:
Modifikasi event listener `fetch` di `public/sw.js` sesuai kebutuhan.

### Sesuaikan Offline Page:
Edit `app/offline/page.tsx` untuk mengubah tampilan dan pesan offline.

## 🚨 Hal Penting untuk Production

### 1. **HTTPS Required**
PWA hanya bekerja di HTTPS (kecuali localhost). Pastikan deploy dengan SSL certificate.

### 2. **Icon PWA**
Tambahkan icon PWA proper (192x192, 512x512) ke folder `/public/pwa/` dan update manifest.

### 3. **Test di Berbagai Device**
- Test di Android Chrome
- Test di iOS Safari  
- Test di desktop browsers

### 4. **Service Worker Update**
Ketika ada update kode, service worker harus di-update. Perhatikan cache versioning di `sw.js`.

## 🔍 Debugging

### Cek Service Worker:
1. Developer Tools > Application > Service Workers
2. Pastikan status "Activated and running"

### Cek Cache:
1. Developer Tools > Application > Storage > Cache Storage
2. Lihat isi cache `lensfolia-v1`

### Cek Network:
1. Developer Tools > Network
2. Toggle offline mode untuk test

## 📋 Next Steps untuk Enhancement

1. **Background Sync** - Sync data ketika online kembali
2. **Push Notifications** - Notifikasi dari server
3. **Advanced Caching** - Strategi caching yang lebih canggih
4. **Pre-caching** - Cache halaman sebelum user kunjungi

---

🎉 **Selamat! LensFolia sudah support offline mode dan bisa diinstall sebagai PWA!**
