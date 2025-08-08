# Push Notification Integration

## Ringkasan

Saya telah mengintegrasikan sistem push notification ke dalam aksi komentar dan balasan di forum menggunakan API endpoint. Sekarang setiap kali pengguna mengirim komentar atau membalas komentar lain, sistem akan:

1. Menyimpan notifikasi ke database
2. Mengirim push notification ke pengguna yang relevan

## Pendekatan Implementasi: API-Based

Menggunakan API endpoint `/api/v1/notifications` untuk menangani notifikasi, memberikan beberapa keuntungan:
- ✅ **Modular**: Logika notifikasi terpusat di API endpoint
- ✅ **Testable**: API dapat ditest secara independen 
- ✅ **Maintainable**: Mudah diubah tanpa mengubah komponen frontend
- ✅ **Reusable**: Dapat digunakan dari komponen lain atau external services
- ✅ **Error Handling**: Error handling terpusat di API layer

## File yang Dibuat/Dimodifikasi

### 1. **NEW**: `/next/app/api/v1/notifications/route.ts`
- **Fungsi**: API endpoint untuk membuat notifikasi + push notification
- **Features**:
  - Validasi input (required fields, content_type)
  - Anti-spam (tidak notifikasi jika reply ke diri sendiri)
  - Integrasi dengan `createNotificationWithPush`
  - Error handling yang proper
  - Response yang informatif

### 2. `/next/components/forum/PostPage.tsx`
- **Fungsi yang diubah**: `handleCommentSubmit`
- **Perubahan**: 
  - Mengganti direct import dengan HTTP call ke `/api/v1/notifications`
  - Payload yang dikirim: subscriber, created_by, content_type, content_uri, ref_forums, ref_discussions

### 3. `/next/components/forum/CommentItem.tsx`
- **Fungsi yang diubah**: `handleReplySubmit`
- **Perubahan**:
  - Mengganti direct import dengan HTTP call ke `/api/v1/notifications`
  - Payload yang dikirim: subscriber, created_by, content_type, content_uri, ref_comments, ori_discussion, ori_comments

## API Endpoint Specification

### `POST /api/v1/notifications`

**Request Body:**
```typescript
{
  subscriber: string;          // ID user yang akan menerima notifikasi
  created_by: string;          // ID user yang membuat aksi
  content_type: 'discussions' | 'comments'; // Tipe konten
  content_uri: string;         // URL untuk navigasi
  ref_forums?: string;         // ID forum (untuk reply ke post)
  ref_discussions?: string;    // ID discussion (untuk reply ke post)
  ref_comments?: string;       // ID comment (untuk reply ke comment)
  ori_discussion?: string;     // ID discussion asli
  ori_comments?: string;       // ID comment asli
}
```

**Response (Success):**
```typescript
{
  success: true;
  message: string;
  data?: NotificationData;
  skipped?: boolean; // true jika tidak perlu notifikasi (self-reply)
}
```

**Response (Error):**
```typescript
{
  error: string;
}
```

## Alur Kerja Notifikasi

### Skenario 1: Komentar Baru pada Post
1. User B mengomentari post User A
2. `POST /api/v1/notifications` dengan payload:
   ```json
   {
     "subscriber": "user_a_id",
     "created_by": "user_b_id", 
     "content_type": "discussions",
     "content_uri": "/forum/post/123#d-456",
     "ref_forums": "123",
     "ref_discussions": "456"
   }
   ```
3. API menyimpan ke database + mengirim push notification
4. User A menerima: "💬 Balasan Baru - User B membalas postingan Anda"

### Skenario 2: Balasan pada Komentar
1. User B membalas komentar User A
2. `POST /api/v1/notifications` dengan payload:
   ```json
   {
     "subscriber": "user_a_id",
     "created_by": "user_b_id",
     "content_type": "comments", 
     "content_uri": "/forum/post/123#d-456#c-789",
     "ref_comments": "789",
     "ori_discussion": "456",
     "ori_comments": "789"
   }
   ```
3. API menyimpan ke database + mengirim push notification  
4. User A menerima: "💬 Komentar Baru - User B membalas komentar Anda"

## Infrastruktur yang Sudah Ada (Tidak Diubah)

### 1. `/next/app/actions/push-notifications.ts`
- Berisi fungsi untuk mengirim web push notification
- `sendNotificationBasedOnData()` - menentukan format notifikasi berdasarkan tipe konten

### 2. `/next/lib/notifications.ts`
- `createNotificationWithPush()` - fungsi utama untuk membuat notifikasi + push
- Helper functions masih tersedia untuk direct usage jika diperlukan

## Keuntungan Pendekatan API

1. **Separation of Concerns**: Frontend fokus pada UI, API fokus pada business logic
2. **Error Handling**: Centralized error handling di API layer
3. **Validation**: Input validation terpusat
4. **Logging**: Semua aktivitas notifikasi tercatat di server logs
5. **Testing**: API dapat ditest dengan tools seperti Postman/curl
6. **Future Extensions**: Mudah ditambah fitur seperti batch notifications, rate limiting, etc.

## Testing

### Manual Testing dengan curl:
```bash
# Test notification untuk reply ke post
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": "user_a_id",
    "created_by": "user_b_id",
    "content_type": "discussions", 
    "content_uri": "/forum/post/123#d-456",
    "ref_forums": "123",
    "ref_discussions": "456"
  }'

# Test notification untuk reply ke comment
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": "user_a_id", 
    "created_by": "user_b_id",
    "content_type": "comments",
    "content_uri": "/forum/post/123#c-789",
    "ref_comments": "789"
  }'
```

## Error Handling

- ✅ Input validation dengan status code 400
- ✅ Self-reply detection (return success dengan skipped: true)
- ✅ Database/Push notification errors dengan status code 500
- ✅ Frontend tetap berfungsi meskipun notifikasi gagal
- ✅ Comprehensive error logging

Pendekatan API ini lebih bersih, scalable, dan mudah dimaintain dibanding direct import!
