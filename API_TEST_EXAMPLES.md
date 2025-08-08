# API Testing Examples

## Test Notification API dengan curl

### 1. Test Reply ke Post
```bash
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
```

### 2. Test Reply ke Comment
```bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": "user_a_id",
    "created_by": "user_b_id", 
    "content_type": "comments",
    "content_uri": "/forum/post/123#d-456#c-789",
    "ref_comments": "789",
    "ori_discussion": "456",
    "ori_comments": "789"
  }'
```

### 3. Test Self-Reply (Should Skip)
```bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": "user_a_id",
    "created_by": "user_a_id",
    "content_type": "discussions", 
    "content_uri": "/forum/post/123#d-456",
    "ref_forums": "123",
    "ref_discussions": "456"
  }'
```

### 4. Test Invalid Request
```bash
curl -X POST http://localhost:3000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "subscriber": "user_a_id"
  }'
```

## Expected Responses

### Success Response:
```json
{
  "success": true,
  "message": "Notification created and push sent successfully", 
  "data": { "id": "...", "created_at": "...", ... }
}
```

### Self-Reply Skip Response:
```json
{
  "success": true,
  "message": "No notification needed for self-reply",
  "skipped": true
}
```

### Error Response:
```json
{
  "error": "Missing required fields: subscriber, created_by, content_type, content_uri"
}
```
