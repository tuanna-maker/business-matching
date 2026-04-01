# Test Accounts

> ⚠️ **Chỉ sử dụng cho môi trường development/staging**
>
> Mật khẩu chung: **`Demo123!`**
>
> Seed / reset toàn bộ: `pnpm --filter api db:seed:realistic`

---

## Admin

| Email | Password | Role |
|-------|----------|------|
| `admin@iechub.vn` | `Demo123!` | Platform Admin |

---

## Startups (6 công ty)

| Email | Người đại diện | Công ty | Ngành | Stage | Raise | Trust | IEC |
|-------|---------------|---------|-------|-------|-------|-------|-----|
| `founder@vietmind.ai` | Nguyễn Minh Tuấn | **VietMind AI** | HealthTech | Series A | $3M | 82 | L3 |
| `ceo@greenpackvn.com` | Trần Thị Lan Anh | **GreenPack Vietnam** | GreenTech | Seed | $800K | 65 | L2 |
| `founder@medtrackpro.io` | Phạm Đức Hùng | **MedTrack Pro** | HealthTech | Series A | $2.5M | 88 | L3 |
| `ceo@agrolink.vn` | Lê Văn Khoa | **AgroLink Vietnam** | AgriTech | Series A | $4M | 75 | L3 |
| `founder@eduflow.edu.vn` | Hoàng Thị Mai | **EduFlow Vietnam** | EdTech | Series B | $8M | 91 | L3 |
| `ceo@finflash.vn` | Đỗ Thanh Bình | **FinFlash Vietnam** | FinTech | Series A | $5M | 72 | L2 |

> Mọi startup login vào **đều thấy toàn bộ 6 projects** trên Discover (API `GET /projects` trả về tất cả `published`, không filter theo org người xem).

---

## Investors (4 quỹ)

| Email | Người đại diện | Quỹ | Focus | Stage | Ticket | Trust |
|-------|---------------|-----|-------|-------|--------|-------|
| `partner@vietnamventures.vc` | Nguyễn Quốc Anh | **Vietnam Ventures Capital** | B2B SaaS, HealthTech, FinTech | Series A | $500K – $3M | 85 |
| `md@deltavc.asia` | Trương Thành Long | **Delta Ventures Asia** | Consumer Tech, EdTech | Seed, Series A | $200K – $1.5M | 78 |
| `investment@nexushub.fund` | Sarah Lim | **Nexus Hub Fund** | GreenTech, AgriTech | Seed | $100K – $800K | 70 |
| `director@alpharise.capital` | Đinh Văn Phong | **AlphaRise Capital** | Industrial Tech, FinTech | Series A, Series B | $1M – $5M | 88 |

---

## URL truy cập

| Môi trường | URL |
|------------|-----|
| Local Web | http://localhost:3001 |
| Local API | http://localhost:3000 |

---

## Matching pipeline có sẵn (6 deals)

| Startup | Investor | Status hiện tại | Tiến trình |
|---------|----------|-----------------|------------|
| VietMind AI | Vietnam Ventures Capital | `negotiation` | Đã qua DD, term sheet draft $2.5M @ $12M pre-money |
| EduFlow Vietnam | Delta Ventures Asia | `due_diligence` | DD checklist gửi, đang review data room confidential |
| MedTrack Pro | AlphaRise Capital | `meeting_scheduled` | Board presentation scheduled 15/04/2026 |
| AgroLink Vietnam | Nexus Hub Fund | `in_discussion` | Thảo luận impact metrics và cộng đồng nông dân |
| FinFlash Vietnam | AlphaRise Capital | `intro_done` | FinFlash gửi one-pager, chờ phản hồi |
| GreenPack Vietnam | Nexus Hub Fund | `pending_intro` | Mới khởi tạo, chờ intro |

---

## Events (12 sự kiện)

Dữ liệu events qua API `GET /events` — events module đã được kích hoạt:

| Sự kiện | Loại | Thời gian | Slot |
|---------|------|-----------|------|
| Vietnam Startup Pitch Night Q2 2026 | OFFLINE | +14 ngày | 63/80 |
| Deep-Dive: HealthTech Investment Thesis | ONLINE | +7 ngày | 38/50 |
| IEC Level Up Workshop | HYBRID | +10 ngày | 18/20 |
| Founder AMA: Hành trình Seed → Series A (EduFlow CEO) | ONLINE | +5 ngày | 89/100 |
| Deal Clinic: Đọc và đàm phán Term Sheet | ONLINE | +17 ngày | 14/15 |
| Blockchain & Web3 in Supply Chain | OFFLINE | +12 ngày | 31/45 |
| AgriTech & GreenTech Founders Meetup | OFFLINE | +21 ngày | 27/40 |
| FinTech Open House: AlphaRise Capital | OFFLINE | +28 ngày | FULL |
| Vietnam–Singapore VC Bridge Networking | HYBRID | +35 ngày | 44/60 |
| EdTech Innovation Summit 2026 | OFFLINE | +45 ngày | 147/200 |
| Impact Investing Roundtable — ESG Focus | OFFLINE | +60 ngày | 22/30 |
| IEC Hub Demo Day Tháng 3/2026 | OFFLINE | -3 ngày (đã qua) | 115/120 |

---

## Social Feed (12 activity items)

Dữ liệu cho tab Social / `GET /social/feed`:
- Partnership announcements, milestone updates, funding news, award wins
- Mỗi startup có 2 items, gắn với `org_id` tương ứng

---

## Vault / Data Room

| Startup | Public docs | Protected docs | Confidential docs | Requests |
|---------|------------|----------------|-------------------|----------|
| Mỗi startup | 1 Company Overview | 1 Pitch Deck | 2 (Financials + Cap Table) | 3 requests có sẵn (2 accepted, 1 pending) |

---

## Watchlist / MatchIntent (11 intents)

Các investors đã "liked" projects trước khi tạo deal chính thức:
- Vietnam Ventures → VietMind, MedTrack, EduFlow
- Delta Ventures → EduFlow, GreenPack, AgroLink
- Nexus Hub → AgroLink, GreenPack
- AlphaRise → FinFlash, MedTrack, VietMind

---

## Ghi chú

- Tất cả tài khoản đã có **email verified**, **org + profile đầy đủ**, **trust score**, **data room + documents**.
- Không cần verify email hay setup thêm sau khi seed.
- Events API đã active — không cần env var `NEXT_PUBLIC_EVENTS_API_ENABLED`.
- Xoá và seed lại toàn bộ: `pnpm --filter api db:seed:realistic`
