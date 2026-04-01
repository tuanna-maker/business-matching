### IEC Hub – API Smoke Tests (cURL)

> Ghi chú: cập nhật URL, token, ID theo môi trường thực tế. Mặc định API chạy tại `http://localhost:3001/api`.

#### 1. Auth & Profile

**1.1 Register Startup (tuỳ chọn, nếu chưa seed)**

```bash
curl -X POST http://localhost:3001/api/auth/register/startup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Demo Startup",
    "email": "startup@example.com",
    "password": "123456",
    "company_name": "Demo Startup Company"
  }'
```

**1.2 Register Investor (tuỳ chọn)**

```bash
curl -X POST http://localhost:3001/api/auth/register/investor \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Demo Investor",
    "email": "investor@example.com",
    "password": "123456",
    "organization_name": "Demo Fund"
  }'
```

**1.3 Login (Startup)**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "startup@example.com",
    "password": "123456"
  }'
```

Ghi lại `accessToken` từ response để dùng cho các bước sau:

```bash
export IEC_TOKEN="PASTE_ACCESS_TOKEN_HERE"
```

**1.2 /me**

```bash
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer $IEC_TOKEN"
```

**1.3 Update profile**

```bash
curl -X PATCH http://localhost:3001/api/me \
  -H "Authorization: Bearer $IEC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Startup Name"
  }'
```

#### 2. Projects & Data Room

**2.1 Tạo project**

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Authorization: Bearer $IEC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Project",
    "description": "Demo description",
    "industry": "Fintech",
    "stage": "Seed"
  }'
```

Lưu lại `PROJECT_ID` từ response:

```bash
export PROJECT_ID="PASTE_PROJECT_ID_HERE"
```

**2.2 List project của tôi**

```bash
curl -X GET "http://localhost:3001/api/projects?owner=me" \
  -H "Authorization: Bearer $IEC_TOKEN"
```

**2.3 Publish project**

```bash
curl -X PATCH http://localhost:3001/api/projects/$PROJECT_ID/status \
  -H "Authorization: Bearer $IEC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "status": "published" }'
```

**2.4 Data Room – tạo metadata (Startup)**

```bash
curl -X POST http://localhost:3001/api/projects/$PROJECT_ID/data-room \
  -H "Authorization: Bearer $IEC_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Data Room",
    "description": "Pitch deck + basic financials"
  }'
```

#### 3. IEC

**3.1 Lấy IEC levels**

```bash
curl -X GET http://localhost:3001/api/iec/levels \
  -H "Authorization: Bearer $IEC_TOKEN"
```

**3.2 Request assessment cho project**

```bash
curl -X POST http://localhost:3001/api/iec/projects/$PROJECT_ID/assessments \
  -H "Authorization: Bearer $IEC_TOKEN"
```

**3.3 Xem lịch sử assessment**

```bash
curl -X GET http://localhost:3001/api/iec/projects/$PROJECT_ID/assessments \
  -H "Authorization: Bearer $IEC_TOKEN"
```

#### 4. Matching (Investor)

Đầu tiên login với tài khoản investor để lấy token:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "password": "123456"
  }'

export IEC_INVESTOR_TOKEN="PASTE_INVESTOR_ACCESS_TOKEN_HERE"
```

**4.1 Discover projects**

```bash
curl -X GET "http://localhost:3001/api/discover/projects" \
  -H "Authorization: Bearer $IEC_INVESTOR_TOKEN"
```

**4.2 Express interest (create intent)**

```bash
export TARGET_PROJECT_ID="PASTE_PUBLISHED_PROJECT_ID_HERE"

curl -X POST http://localhost:3001/api/matching/intents \
  -H "Authorization: Bearer $IEC_INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$TARGET_PROJECT_ID\",
    \"note\": \"Interested in further discussion\"
  }"
```

#### 5. Matches & Admin (tối giản)

**5.1 Xem matches cho current user**

```bash
curl -X GET http://localhost:3001/api/matching/matches \
  -H "Authorization: Bearer $IEC_TOKEN"
```

**5.2 Admin – metrics (cần token admin)**

```bash
export IEC_ADMIN_TOKEN="PASTE_ADMIN_ACCESS_TOKEN_HERE"

curl -X GET http://localhost:3001/api/admin/dashboard/metrics \
  -H "Authorization: Bearer $IEC_ADMIN_TOKEN"
```

**5.3 Admin – audit logs**

```bash
curl -X GET "http://localhost:3001/api/admin/audit-logs" \
  -H "Authorization: Bearer $IEC_ADMIN_TOKEN"
```

#### 6. Notifications (realtime)

**6.1 List notifications cho current user**

```bash
curl -X GET http://localhost:3001/api/notifications \
  -H "Authorization: Bearer $IEC_TOKEN"
```

**6.2 Đánh dấu đã đọc**

```bash
export NOTIFICATION_ID="PASTE_NOTIFICATION_ID_HERE"

curl -X PATCH http://localhost:3001/api/notifications/$NOTIFICATION_ID/read \
  -H "Authorization: Bearer $IEC_TOKEN"
```

