# IEC Hub - Agent Context File (v4.0)
## Last Updated: 2026-03-22

> **QUAN TRỌNG**: Đây là file context cho AI Agent. Khi bắt đầu conversation mới,
> hãy yêu cầu agent đọc file này để hiểu context dự án.
> 
> **Prompt**: "Đọc file docs/CONTEXT.md để hiểu context dự án"

---

## 🎯 DỰ ÁN: IEC Hub - Trust-based B2B Data Infrastructure

### Triết lý cốt lõi
**"Bán hàng như không bán hàng"** - Social Capital over Virtual Currency

**5 Strategic Pillars:**
1. **Identity & OA Management** - The Gatekeeper (Multi-tenant như Meta Business)
2. **Dynamic Project Feed & AI Matching** - The Heart ("Thông tin tìm người dùng")
3. **Tiered Data Exchange** - The Trust (3-tier security)
4. **Event Facilitation** - The Action (Events as "touch points")
5. **Reputation & Social Capital** - The Soul (Trust Score, Vouching, Badges)

---

## 🚨 CRITICAL: THÔNG TIN CẦN NHỚ CHO SESSION MỚI

### Cách chạy dự án
```bash
# Terminal 1: API Server (port 3000)
cd apps/api && pnpm run dev

# Terminal 2: Web App (port 5173)
cd apps/web && pnpm run dev
```

### Tài khoản test (Password: `Admin123!`)
| Email | OA Type | Trust Level |
|-------|---------|-------------|
| `startup@iec-hub.com` | Startup | VERIFIED |
| `investor@iec-hub.com` | Investor | TRUSTED |
| `admin@iec-hub.com` | Admin | ELITE |
| `sme@iec-hub.com` | SME | NEWCOMER |
| `researcher@iec-hub.com` | Researcher | VERIFIED |

### ⚠️ LƯU Ý QUAN TRỌNG

1. **Email Validation**: CHỈ cho phép email công ty (block gmail, yahoo, hotmail, etc.)

2. **Route prefix**: `main.ts` đã set `app.setGlobalPrefix("api")`, controller KHÔNG thêm `api/` vào @Controller
   - ❌ Sai: `@Controller('api/auth')`
   - ✅ Đúng: `@Controller('auth')`

3. **Multi-OA Support**: 1 User có thể thuộc nhiều OA (như Meta Business Suite)

4. **Trust Levels**: NEWCOMER (0-24) → VERIFIED (25-49) → TRUSTED (50-74) → ELITE (75-100)

5. **Data Vault 3 Tiers**:
   - Tier 1 (PUBLIC): Xem tự do
   - Tier 2 (PROTECTED): Cần request + được approve
   - Tier 3 (CONFIDENTIAL): Cần NDA + approval

---

## 📊 4 TARGET PERSONAS (OA Types)

| Type | Seeking | Có gì để offer |
|------|---------|----------------|
| **STARTUP** | Investment, Customers, Partners | Product/Service, Tech, Vision |
| **INVESTOR** | Deal flow, Co-investors | Capital, Network, Expertise |
| **SME** | Digital transformation, Partners | Domain expertise, Customer base |
| **RESEARCHER** | Data, Industry insights | Analysis, Reports |

---

## 🏗️ CẤU TRÚC KIẾN TRÚC

### Monorepo Structure
```
business-matching/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── prisma/       # Database schema & migrations
│   │   └── src/
│   │       ├── auth/     # EPIC 1: Identity
│   │       ├── oa/       # EPIC 1: OA Management  
│   │       ├── projects/ # EPIC 2: Project Feed
│   │       ├── matching/ # EPIC 2: AI Matching
│   │       ├── data-vault/ # EPIC 3: Tiered Data
│   │       ├── events/   # EPIC 4: Events
│   │       ├── bookings/ # EPIC 4: Calendar
│   │       ├── trust/    # EPIC 5: Trust Score
│   │       └── admin/    # Admin features
│   │
│   ├── web/              # React Web App
│   └── mobile/           # React Native App
│
├── packages/
│   └── shared/           # Shared types/DTOs
│
└── docs/                 # Documentation v4.0
```

### Technology Stack
- **Backend**: NestJS 10 + Prisma ORM + PostgreSQL 15
- **Frontend**: React 18 + Vite + TailwindCSS
- **Cache**: Redis
- **Search**: Elasticsearch (optional)
- **Auth**: JWT (access 15m, refresh 7d)

---

## 📡 API ENDPOINTS (v4.0)

### Auth Module (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /register | Đăng ký (email công ty only) |
| POST | /verify-email | Verify email bằng token |
| POST | /login | Đăng nhập |
| POST | /refresh | Refresh access token |
| GET | /me | Lấy user + OA memberships |
| POST | /logout | Đăng xuất |

### OA Module (`/api/oa`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | / | Tạo OA mới (set làm primary) |
| GET | /my | Danh sách OA user thuộc |
| GET | /:id | Chi tiết OA |
| PATCH | /:id | Update OA profile |
| POST | /:id/switch | Switch primary OA |
| POST | /:id/members/invite | Mời thành viên |
| PATCH | /:id/members/:userId/role | Đổi role |

### Projects Module (`/api/projects`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | / | Tạo project |
| GET | / | Feed (AI-personalized) |
| GET | /:id | Chi tiết project |
| PATCH | /:id | Update project |
| PATCH | /:id/publish | Publish project |
| POST | /:id/milestones | Add milestone |

### Data Vault Module (`/api/data-vault`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /oa/:oaId | Xem data (theo tier được phép) |
| POST | /oa/:oaId/request | Request access tier |
| GET | /requests | Requests đã gửi |
| GET | /incoming-requests | Requests nhận được |
| PATCH | /requests/:id | Approve/Reject request |
| GET | /access-log | Ai đã xem data của mình |

### Events Module (`/api/events`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | / | Tạo event |
| GET | / | Danh sách events |
| GET | /:id | Chi tiết event |
| POST | /:id/register | Đăng ký tham gia |
| GET | /:id/registrations | Danh sách đăng ký |
| PATCH | /:eventId/registrations/:regId | Approve/Reject |

### Bookings Module (`/api/bookings`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/:userId/availability | Xem lịch trống |
| POST | / | Tạo booking request |
| GET | / | Danh sách bookings |
| PATCH | /:id/respond | Confirm/Decline/Reschedule |
| POST | /:id/feedback | Submit feedback sau meeting |

### Matching Module (`/api/matching`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /suggestions | AI match suggestions |
| POST | /suggestions/:id/save | Save suggestion |
| POST | /suggestions/:id/dismiss | Dismiss suggestion |
| POST | /suggestions/:id/connect | Connect (tạo booking) |

### Trust Module (`/api/trust`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /oa/:oaId/score | Trust score + breakdown |
| GET | /oa/:oaId/badges | Badges được nhận |
| POST | /oa/:oaId/vouch | Vouch for OA khác |
| GET | /oa/:oaId/vouches | Danh sách vouches |
| GET | /spotlights | Featured businesses |

---

## 🗃️ DATABASE SCHEMA (Core Entities)

### Enums
```prisma
enum OAType { STARTUP, INVESTOR, SME, RESEARCHER }
enum OARole { OWNER, ADMIN, MEMBER, VIEWER }
enum TrustLevel { NEWCOMER, VERIFIED, TRUSTED, ELITE }
enum DataTier { PUBLIC, PROTECTED, CONFIDENTIAL }
enum DataAccessStatus { PENDING, APPROVED, REJECTED, EXPIRED, REVOKED }
enum ProjectStatus { DRAFT, PUBLISHED, ARCHIVED }
enum EventType { KYB_WORKSHOP, INDUSTRY_MEETUP, PITCH_SESSION, KNOWLEDGE_SHARE, DEAL_FLOW_REVIEW }
enum BookingStatus { PENDING, CONFIRMED, DECLINED, RESCHEDULED, COMPLETED, CANCELLED }
enum MatchStatus { NEW, VIEWED, SAVED, CONNECTED, DISMISSED }
```

### Core Models
- **User**: Account với email verified, multi-OA support
- **BusinessOA**: Organization Account (4 types với type-specific profile)
- **OAMembership**: User ↔ OA relationship (role-based)
- **Project**: Product/Service/Initiative showcase
- **DataVault**: 3-tier data security per OA
- **DataAccessRequest**: Request + NDA flow
- **Event**: Workshop, Meetup, Pitch sessions
- **Booking**: 1-1 meeting scheduling
- **TrustScore**: 4 pillars (Identity, Transparency, Execution, Community)
- **Vouch**: Peer endorsement system
- **MatchSuggestion**: AI-generated match with score + reasons

---

## 📋 DOCUMENTATION FILES (v4.0)

| File | Status | Description |
|------|--------|-------------|
| [BRD.md](BRD.md) | ✅ v4.0 | Business Requirements |
| [SRS.md](SRS.md) | ✅ v4.0 | Software Requirements (Use Cases, APIs) |
| [TECH-SPEC.md](TECH-SPEC.md) | ✅ v4.0 | Technical Specification (Schema, Architecture) |
| [CONTEXT.md](CONTEXT.md) | ✅ v4.0 | Agent Context (this file) |

---

## 🎯 5 EPICs SUMMARY

### EPIC 1: Identity & OA Management (The Gatekeeper)
- Corporate email validation (block gmail, yahoo, etc.)
- Email verification flow
- Multi-OA support (1 user → many OAs)
- 4 OA types với type-specific profiles
- Role-based membership (Owner, Admin, Member, Viewer)

### EPIC 2: Dynamic Project Feed & AI Matching (The Heart)
- AI-personalized feed ("Thông tin tìm người dùng")
- Project showcase với milestones
- Match suggestions với score + reasons
- Save/Dismiss/Connect flow

### EPIC 3: Tiered Data Exchange (The Trust)
- 3 security tiers (Public → Protected → Confidential)
- Request + Approval flow
- NDA signing cho Tier 3
- Access logging cho audit

### EPIC 4: Event Facilitation (The Action)
- Multiple event types (KYB Workshop, Pitch Session, etc.)
- Registration + Approval flow
- 1-1 Booking system
- Meeting feedback

### EPIC 5: Reputation & Social Capital (The Soul)
- Trust Score (0-100) với 4 pillars:
  - Identity (25): Email verified, OA verified, Tax code, 2FA
  - Transparency (25): Profile complete, Active projects, Recent updates
  - Execution (25): Bookings completed, Events attended, Feedback positive
  - Community (25): Vouches received, Collaborations, Event hosting
- Badges system (Bronze → Silver → Gold → Platinum)
- Vouching system (peer endorsement)
- Business Spotlight (featured stories)

---

## ⚙️ TRUST-BASED ACCESS RULES

| Trust Level | Score | Feed Items/day | Match Suggestions | Data Access | Vouch Ability |
|-------------|-------|----------------|-------------------|-------------|---------------|
| NEWCOMER | 0-24 | 30 | 5 | Tier 1 only | ❌ |
| VERIFIED | 25-49 | 60 | 15 | Can request Tier 2 | ❌ |
| TRUSTED | 50-74 | 120 | 30 | Can request Tier 3 | ✅ |
| ELITE | 75-100 | Unlimited | 50 | Full access | ✅ + Featured |

---

## 🔐 SECURITY NOTES

1. **JWT Tokens**: Access (15m) + Refresh (7d)
2. **Rate Limiting**: By trust level
3. **Data Tier Access**: Guard middleware checks approval
4. **Audit Logging**: All mutations logged
5. **NDA Flow**: Required for Tier 3 (Confidential) access
