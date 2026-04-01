# PRD: AI-Powered Investment Score

## 1. Tổng quan

### 1.1. Mục tiêu
Xây dựng hệ thống điểm số thông minh (Investment Score 0–100) giúp Investor đánh giá nhanh chất lượng dự án dựa trên dữ liệu định lượng và định tính, từ đó giảm thời gian sàng lọc từ 30 phút xuống còn 5 phút/project.

### 1.2. Phạm vi
- **Backend**: Tính toán điểm số tự động, lưu trữ kết quả, cung cấp API.
- **Frontend**: Hiển thị điểm số trên Project Card, Project Detail, Dashboard.
- **AI/ML**: Sử dụng mô hình weighted scoring (không cần training phức tạp ở giai đoạn MVP).

### 1.3. Đối tượng người dùng
- **Investor**: Xem điểm số, lọc theo điểm.
- **Startup**: Xem điểm số của chính mình để cải thiện.
- **Admin/IEC**: Cấu hình trọng số các tiêu chí.

---

## 2. User Stories

| ID | Vai trò | Yêu cầu | Tiêu chí chấp nhận |
|----|---------|---------|-------------------|
| US-01 | Investor | Tôi muốn xem Investment Score của mỗi project | Điểm số hiển thị trên Project Card và Project Detail |
| US-02 | Investor | Tôi muốn lọc project theo Investment Score (ví dụ: ≥ 70) | Bộ lọc hoạt động trên Discover page |
| US-03 | Startup | Tôi muốn biết điểm số của project mình để cải thiện | Hiển thị chi tiết từng tiêu chí trên Dashboard |
| US-04 | Admin | Tôi muốn điều chỉnh trọng số các tiêu chí | Admin panel cho phép cập nhật weight, thay đổi áp dụng ngay |
| US-05 | Investor | Tôi muốn biết lý do điểm số cao/thấp | Tooltip hiển thị breakdown (ví dụ: "IEC Level: 40/40") |

---

## 3. Yêu cầu chức năng

### 3.1. Mô hình tính toán điểm số

**Công thức:**
```
Investment Score = (IEC_Level_Score × 40%) + (Profile_Completeness × 20%) + (Engagement_Score × 20%) + (Activity_Score × 10%) + (Financial_Consistency × 10%)
```

**Chi tiết từng thành phần:**

| Thành phần | Trọng số | Cách tính |
|-----------|----------|-----------|
| **IEC_Level_Score** | 40% | L0 = 0, L1 = 25, L3 = 40 |
| **Profile_Completeness** | 20% | % hoàn thiện các field: title, summary, industry, stage, funding, logo, hero_image, data_room_files ≥ 3 |
| **Engagement_Score** | 20% | (Data_Room_Requests_Accepted × 10) + (Match_Intents × 5), max 20 |
| **Activity_Score** | 10% | Cập nhật < 7 ngày: 10, < 30 ngày: 5, > 30 ngày: 0 |
| **Financial_Consistency** | 10% | Có file financials: 10, không: 0 |

**Giới hạn:**
- Điểm tối đa: 100
- Điểm làm tròn đến số nguyên gần nhất
- Điểm được cập nhật tự động khi có sự kiện:
  - IEC Level thay đổi
  - Startup cập nhật hồ sơ
  - Có Data Room Request mới
  - Có Match Intent mới
  - Upload file mới

### 3.2. API Endpoints

#### `GET /discover/projects` (mở rộng)
**Query params:**
```
?investment_score_min=70
&investment_score_max=90
```

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "EdTech Startup",
      "investment_score": 85,
      "score_breakdown": {
        "iec_level": 40,
        "profile_completeness": 18,
        "engagement": 15,
        "activity": 10,
        "financial": 2
      }
    }
  ]
}
```

#### `GET /projects/:id/score`
**Response:**
```json
{
  "project_id": "uuid",
  "investment_score": 85,
  "score_breakdown": {
    "iec_level": { "score": 40, "max": 40, "reason": "IEC Level 3" },
    "profile_completeness": { "score": 18, "max": 20, "reason": "Thiếu 1 tài liệu tài chính" },
    "engagement": { "score": 15, "max": 20, "reason": "5 Data Room requests được chấp thuận" },
    "activity": { "score": 10, "max": 10, "reason": "Cập nhật 3 ngày trước" },
    "financial": { "score": 2, "max": 10, "reason": "Chỉ có 1 file financials" }
  },
  "last_updated": "2026-03-17T10:00:00Z"
}
```

#### `PATCH /admin/investment-score/weights` (Admin only)
**Request:**
```json
{
  "weights": {
    "iec_level": 0.4,
    "profile_completeness": 0.2,
    "engagement": 0.2,
    "activity": 0.1,
    "financial": 0.1
  }
}
```

### 3.3. Database Schema (Prisma)

```prisma
model InvestmentScore {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id    String   @db.Uuid
  score         Int      // 0–100
  breakdown     Json     // { iec_level: 40, profile_completeness: 18, ... }
  calculated_at DateTime @default(now()) @db.Timestamptz

  project Project @relation(fields: [project_id], references: [id], onDelete: Cascade)

  @@unique([project_id, calculated_at])
  @@index([project_id])
}
```

### 3.4. Events & Triggers

| Sự kiện | Hành động |
|---------|-----------|
| `Project.updated` | Tính lại điểm, lưu vào `InvestmentScore` |
| `IecAssessment.finalized` | Tính lại điểm |
| `DataRoomRequest.accepted` | Tăng engagement score |
| `MatchIntent.created` | Tăng engagement score |
| `ProjectDocument.uploaded` | Kiểm tra financial file, tính lại điểm |

---

## 4. Yêu cầu phi chức năng

### 4.1. Hiệu năng
- Tính toán điểm phải hoàn thành trong < 500ms.
- Cache điểm số trong Redis (TTL: 1 giờ) để giảm tải DB.
- API `/discover/projects` không được chậm hơn 20% khi có filter `investment_score_min`.

### 4.2. Bảo mật
- Chỉ Investor và Startup (chủ project) mới xem được điểm số chi tiết.
- Admin có thể xem điểm số của tất cả project.

### 4.3. Khả năng mở rộng
- Thiết kế modular để dễ dàng thay đổi công thức tính điểm.
- Hỗ trợ thêm tiêu chí mới trong tương lai (ví dụ: "Team Experience").

---

## 5. UI/UX Requirements

### 5.1. Project Card
- Hiển thị **Investment Score** dưới dạng badge màu:
  - 80–100: Xanh lá (#10B981)
  - 60–79: Vàng (#F59E0B)
  - 0–59: Xám (#6B7280)
- Tooltip khi hover: "Score: 85/100 – IEC Level 3, 90% profile hoàn thiện"

### 5.2. Project Detail Page
- Hiển thị **Investment Score** lớn ở đầu trang.
- Breakdown chi tiết dưới dạng progress bar cho từng thành phần.
- Gợi ý cải thiện: "Bạn có thể tăng 10 điểm bằng cách upload file tài chính".

### 5.3. Discover Page
- Bộ lọc: "Investment Score ≥ [slider 0–100]".
- Sort by: "Relevance", "Investment Score (High to Low)", "Date".

### 5.4. Startup Dashboard
- Hiển thị điểm số của từng project.
- Checklist cải thiện điểm: "Upload file tài chính (+10 điểm)".

---

## 6. Metrics đo lường

| Metric | Mục tiêu | Cách đo |
|--------|----------|---------|
| **Thời gian sàng lọc** | Giảm 80% (30 → 5 phút/project) | Survey Investor sau 1 tháng |
| **Tỷ lệ chuyển đổi Match** | Tăng 25% | (Match Intent / Project View) |
| **Tỷ lệ sử dụng filter** | ≥ 60% Investor dùng filter điểm số | Analytics: số lần filter điểm |
| **Độ chính xác** | ≥ 85% dự đoán đúng project chất lượng | So sánh điểm số với deal closed |

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Điểm số không phản ánh đúng chất lượng | Cho phép Investor feedback "Điểm số không chính xác" để cải thiện mô hình |
| Startup "gian lận" để tăng điểm | Giới hạn engagement score, kiểm tra chất lượng file financials |
| Investor không tin tưởng điểm số | Công bố công khai công thức tính, cho phép xem breakdown |

---

## 8. Timeline triển khai

| Phase | Công việc | Thời gian |
|-------|-----------|-----------|
| **Phase 1** | DB Schema + Backend tính toán điểm | 3 ngày |
| **Phase 2** | API Endpoints + Redis cache | 2 ngày |
| **Phase 3** | UI Project Card + Project Detail | 3 ngày |
| **Phase 4** | Discover filter + Startup Dashboard | 2 ngày |
| **Phase 5** | Admin panel cấu hình weights | 1 ngày |
| **Tổng** | | **11 ngày** |

---

## 9. Phụ lục

### 9.1. Tài liệu tham khảo
- BRD v2.0: Luật hiển thị Marketplace, Luật Độc quyền Level 3.
- SRS: Yêu cầu về Dashboard Gamification.
- Tech Spec: Prisma Schema, API structure.

### 9.2. Ghi chú
- Giai đoạn đầu: Sử dụng weighted scoring đơn giản, không dùng ML phức tạp.
- Giai đoạn sau: Có thể train mô hình ML dựa trên dữ liệu lịch sử (deal closed, rejected).
