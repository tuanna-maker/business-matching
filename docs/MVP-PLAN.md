# MVP Plan: IEC Hub - Pilot (Tháng 4)

## Vision
Tạo một nền tảng B2B Event-Driven Network để thu thập dữ liệu và xác thực doanh nghiệp trong tháng 4, thay vì xây dựng một Marketplace phức tạp. Tập trung vào 4 tính năng cốt lõi: Auth với email công ty, OA Setup, Calendar Booking, và Landing Page Builder.

## Scope (Cắt giảm mạnh)

| Feature | Priority | Reason |
|---------|----------|--------|
| **Email Domain Validation & OA Setup** | P0 | Cốt lõi để xác thực user. Không cho gmail/yahoo. |
| **Calendar & Event Booking** | P0 | Trung tâm của pilot. Tạo sự kiện và book hẹn để kéo data. |
| **Landing Page Builder** | P0 | Công cụ truyền thông tự động, tạo viral loop. |
| **Workshop KYB Integration** | P0 | Xác thực doanh nghiệp, tăng độ tin cậy. |
| **Notification & Email** | P1 | Cần thiết để remind user, nhưng dùng template đơn giản. |
| **Dashboard** | P1 | Chỉ cần basic stats, không cần analytics phức tạp. |

**Cắt bỏ hoàn toàn:**
- IEC Verified Framework (Level 0/1/3)
- Data Room
- AI Matching
- Chat/Real-time Messaging
- Mobile App
- Advanced Search
- Admin Bulk Operations
- Audit Log chi tiết
- Payment/Subscription

## Implementation Plan (Timeline: 4 Weeks)

### Phase 1: Auth & OA Setup (Week 1)

- **Backend**:
  - Cập nhật `/auth/register` để validate email domain (regex: `^[^@]+@[^@\.]+\.[^@\.]+$` + whitelist domain)
  - Tạo model `Organization` với field: `type` (Startup, Investor, Enterprise), `name`, `tax_id`, `website`, `verified` (boolean)
  - Tạo API `/api/organization/setup` để user OA cập nhật profile
  - Thêm middleware `AuthMiddleware` để kiểm tra user đã OA chưa
- **Frontend**:
  - Tạo Wizard đăng ký OA: 3 bước (Chọn loại tổ chức, nhập thông tin, upload giấy tờ optional)
  - Hiển thị thông báo nếu email không hợp lệ ("Vui lòng sử dụng email công ty")
  - Sau khi đăng ký OA, chuyển hướng đến Dashboard

### Phase 2: Calendar & Event Booking (Week 2)

- **Backend**:
  - Tạo model `Event`: title, description, type (Workshop, Networking, Pitching), format (Online/Offline), date, location, max_attendees, created_by (User), status
  - Tạo model `CalendarEvent`: event_id, booker_id, attendee_id, status (Pending, Confirmed, Cancelled), reason, created_at
  - Tạo API:
    - `POST /api/events` (Admin/User OA)
    - `GET /api/events?user_id=...`
    - `POST /api/calendar/book` (Book hẹn)
    - `PATCH /api/calendar/:id/status` (Confirm/Cancel)
  - Implement logic: Lock slot khi booking confirmed, send reminder email 24h/1h trước
- **Frontend**:
  - Tạo Calendar View (dùng FullCalendar.js)
  - Tạo form tạo sự kiện
  - Tạo UI book hẹn: chọn user -> chọn slot -> nhập lý do -> gửi request
  - Hiển thị reminder notification

### Phase 3: Landing Page Builder (Week 3)

- **Backend**:
  - Tạo model `LandingPage`: title, subtitle, description, cover_image_url, event_id, form_fields (JSON), visitor_count, rsvp_count, status (Draft/Published)
  - Tạo API:
    - `POST /api/landing-pages` (create)
    - `GET /api/landing-pages/:id` (view)
    - `PATCH /api/landing-pages/:id/publish`
  - Tạo endpoint `GET /api/landing-pages/:id/analytics` (visitor/rsvp count)
- **Frontend**:
  - 2 template đơn giản: "Workshop Registration" và "Project Pitch"
  - Drag-and-drop form builder (chỉ cho phép 3 field: name, email, phone)
  - Preview mode
  - Share button: copy link, generate QR code

### Phase 4: Workshop KYB & Polish (Week 4)

- **Backend**:
  - Tạo model `Workshop`: title, description, date, location, max_attendees, admin_id
  - Tạo API `/api/workshops` và `/api/workshops/:id/rsvp`
  - Tạo service `KYBVerificationService`: khi user tham gia workshop, cập nhật `Organization.verified = true`
- **Frontend**:
  - Trang danh sách workshop
  - Form RSVP
  - Sau workshop, hiển thị "Chúc mừng! Bạn đã được xác thực KYB!"
- **Polish**:
  - Test email delivery
  - Optimize performance
  - Deploy to staging
  - Prepare for pilot launch

## Success Metrics

| Metric | Mục tiêu |
|--------|----------|
| User đăng ký | 500+ email công ty |
| User verified OA | 200+ |
| Sự kiện tổ chức | 5+ workshops |
| Attendance rate | 60%+ |
| Landing pages tạo | 50+ |
| Booking tạo | 100+ |
| Retention (7 ngày) | 30%+ |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Không đủ user email công ty | Partner với business schools, startup incubators |
| User không tham gia sự kiện | Reminder email, gamification (badges) |
| Booking system phức tạp | Dùng thư viện có sẵn (FullCalendar, Calendly API) |
| Landing page không hấp dẫn | Cung cấp 2-3 template đẹp, hỗ trợ design |
| KYB verification chậm | Tự động hóa một phần (API check mã số thuế) |
