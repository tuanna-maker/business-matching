# IEC Hub – Technical Specification (v4.0)

**Dự án:** IEC Hub - Trust-based B2B Data Infrastructure  
**Phiên bản:** 4.0  
**Ngày cập nhật:** 22/03/2026  

---

## 1. Kiến trúc tổng thể

### 1.1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  Web App    │    │ Mobile App  │    │  Admin App  │                 │
│  │  (React)    │    │(React Native│    │  (React)    │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         └──────────────────┼──────────────────┘                         │
│                            │                                            │
│                     ┌──────┴──────┐                                     │
│                     │   API GW    │                                     │
│                     │ (Rate Limit)│                                     │
│                     └──────┬──────┘                                     │
├─────────────────────────────┼───────────────────────────────────────────┤
│                       SERVICE LAYER                                      │
├─────────────────────────────┼───────────────────────────────────────────┤
│  ┌──────────────────────────┴───────────────────────────────────┐      │
│  │                     NestJS API Server                         │      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│      │
│  │  │  Auth   │ │   OA    │ │ Project │ │  Event  │ │  Trust  ││      │
│  │  │ Module  │ │ Module  │ │ Module  │ │ Module  │ │ Module  ││      │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│      │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │      │
│  │  │  Data   │ │ Booking │ │ Matching│ │  Admin  │            │      │
│  │  │  Vault  │ │ Module  │ │ Module  │ │ Module  │            │      │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │      │
│  └──────────────────────────┬───────────────────────────────────┘      │
│                             │                                           │
├─────────────────────────────┼───────────────────────────────────────────┤
│                        DATA LAYER                                        │
├─────────────────────────────┼───────────────────────────────────────────┤
│  ┌─────────────┐    ┌───────┴───────┐    ┌─────────────┐               │
│  │    Redis    │    │  PostgreSQL   │    │     S3      │               │
│  │   (Cache)   │    │   (Primary)   │    │  (Storage)  │               │
│  └─────────────┘    └───────────────┘    └─────────────┘               │
│                                                                         │
│  ┌─────────────┐    ┌───────────────┐                                   │
│  │Elasticsearch│    │  Message Queue │                                  │
│  │  (Search)   │    │   (Bull/Redis) │                                  │
│  └─────────────┘    └───────────────┘                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2. Monorepo Structure

```
business-matching/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── migrations/     # DB migrations
│   │   │   └── seed.ts         # Seed data
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── auth/           # EPIC 1: Identity
│   │       ├── oa/             # EPIC 1: OA Management
│   │       ├── projects/       # EPIC 2: Project Feed
│   │       ├── matching/       # EPIC 2: AI Matching
│   │       ├── data-vault/     # EPIC 3: Tiered Data
│   │       ├── events/         # EPIC 4: Events
│   │       ├── bookings/       # EPIC 4: Calendar
│   │       ├── trust/          # EPIC 5: Trust Score
│   │       ├── notifications/  # Cross-cutting
│   │       └── admin/          # Admin features
│   │
│   ├── web/                    # React Web App
│   │   └── src/
│   │       ├── components/     # Reusable UI
│   │       ├── screens/        # Page components
│   │       ├── shared/         # Context, hooks
│   │       └── lib/            # API client, utils
│   │
│   └── mobile/                 # React Native App
│       └── src/
│
├── packages/
│   └── shared/                 # Shared types/DTOs
│       └── src/
│           ├── domain/         # Domain types
│           └── api/            # API DTOs
│
└── docs/                       # Documentation
```

### 1.3. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Web application |
| | React Native | Mobile application |
| | TailwindCSS | Styling |
| | TanStack Query | Data fetching & caching |
| **Backend** | NestJS 10 | API framework |
| | Prisma ORM | Database access |
| | Passport | Authentication |
| | Bull | Job queue |
| **Database** | PostgreSQL 15 | Primary database |
| | Redis | Caching & sessions |
| | Elasticsearch | Full-text search |
| **Storage** | S3/MinIO | File storage |
| **Infrastructure** | Docker | Containerization |
| | Nginx | Reverse proxy |
| | GitHub Actions | CI/CD |

---

## 2. Database Schema (Prisma)

### 2.1. Enums

```prisma
// schema.prisma

enum OAType {
  STARTUP
  INVESTOR
  SME
  RESEARCHER
}

enum OARole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum OAVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum TrustLevel {
  NEWCOMER      // 0-24
  VERIFIED      // 25-49
  TRUSTED       // 50-74
  ELITE         // 75-100
}

enum DataTier {
  PUBLIC
  PROTECTED
  CONFIDENTIAL
}

enum DataAccessStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
  REVOKED
}

enum ProjectType {
  PRODUCT
  SERVICE
  INITIATIVE
  CASE_STUDY
  SEEKING
}

enum ProjectStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum EventType {
  KYB_WORKSHOP
  INDUSTRY_MEETUP
  PITCH_SESSION
  KNOWLEDGE_SHARE
  DEAL_FLOW_REVIEW
}

enum EventFormat {
  ONLINE
  OFFLINE
  HYBRID
}

enum BookingStatus {
  PENDING
  CONFIRMED
  DECLINED
  RESCHEDULED
  COMPLETED
  CANCELLED
}

enum MatchStatus {
  NEW
  VIEWED
  SAVED
  CONNECTED
  DISMISSED
}
```

### 2.2. Core Models

#### User & Authentication

```prisma
model User {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String    @unique
  email_verified    Boolean   @default(false)
  password_hash     String
  full_name         String
  phone             String?
  avatar_url        String?
  
  // Multi-OA support
  primary_oa_id     String?   @db.Uuid
  
  // Activity
  last_active_at    DateTime?
  
  // System
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  
  // Relations
  oa_memberships    OAMembership[]
  primary_oa        BusinessOA?       @relation("PrimaryOA", fields: [primary_oa_id], references: [id])
  
  // Audit
  audit_logs        AuditLog[]        @relation("AuditActor")
  
  @@map("users")
}

model EmailVerification {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String    @db.Uuid
  token       String    @unique
  expires_at  DateTime
  verified_at DateTime?
  created_at  DateTime  @default(now())
  
  user        User      @relation(fields: [user_id], references: [id])
  
  @@map("email_verifications")
}

model RefreshToken {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String    @db.Uuid
  token       String    @unique
  expires_at  DateTime
  revoked_at  DateTime?
  created_at  DateTime  @default(now())
  
  user        User      @relation(fields: [user_id], references: [id])
  
  @@map("refresh_tokens")
}

model BlockedEmailDomain {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  domain      String    @unique
  reason      String?
  created_at  DateTime  @default(now())
  
  @@map("blocked_email_domains")
}
```

#### Organization Account (OA)

```prisma
model BusinessOA {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  // Identity
  legal_name            String
  brand_name            String?
  tax_code              String?             @unique
  oa_type               OAType
  
  // Profile
  logo_url              String?
  cover_url             String?
  tagline               String?
  description           String?             @db.Text
  website               String?
  founded_year          Int?
  employee_count_min    Int?
  employee_count_max    Int?
  
  // Location
  headquarters_address  String?
  headquarters_city     String?
  headquarters_country  String?
  operating_regions     String[]
  
  // Verification
  verification_status   OAVerificationStatus @default(PENDING)
  verified_at           DateTime?
  verified_by           String?             @db.Uuid
  
  // Trust
  trust_score           Int                 @default(0)
  trust_level           TrustLevel          @default(NEWCOMER)
  
  // System
  created_at            DateTime            @default(now())
  updated_at            DateTime            @updatedAt
  
  // Relations
  members               OAMembership[]
  primary_users         User[]              @relation("PrimaryOA")
  projects              Project[]
  data_vault            DataVault?
  events_organized      Event[]             @relation("EventOrganizer")
  event_registrations   EventRegistration[]
  bookings_sent         Booking[]           @relation("BookingRequester")
  bookings_received     Booking[]           @relation("BookingTarget")
  vouches_given         Vouch[]             @relation("VouchGiver")
  vouches_received      Vouch[]             @relation("VouchReceiver")
  badges                OABadge[]
  match_suggestions     MatchSuggestion[]   @relation("MatchSource")
  match_targets         MatchSuggestion[]   @relation("MatchTarget")
  
  // Type-specific profiles
  startup_profile       StartupProfile?
  investor_profile      InvestorProfile?
  sme_profile          SMEProfile?
  researcher_profile    ResearcherProfile?
  
  @@map("business_oas")
}

model OAMembership {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id     String      @db.Uuid
  oa_id       String      @db.Uuid
  role        OARole      @default(MEMBER)
  
  joined_at   DateTime    @default(now())
  invited_by  String?     @db.Uuid
  
  user        User        @relation(fields: [user_id], references: [id])
  oa          BusinessOA  @relation(fields: [oa_id], references: [id])
  
  @@unique([user_id, oa_id])
  @@map("oa_memberships")
}

// Type-specific profiles
model StartupProfile {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id                 String      @unique @db.Uuid
  
  stage                 String?     // Idea | MVP | Growth | Scale
  funding_status        String?     // Bootstrapped | Pre-seed | Seed | Series A+
  funding_raised_min    Decimal?    @db.Decimal(15, 2)
  funding_raised_max    Decimal?    @db.Decimal(15, 2)
  funding_seeking_min   Decimal?    @db.Decimal(15, 2)
  funding_seeking_max   Decimal?    @db.Decimal(15, 2)
  funding_currency      String?     @default("USD")
  
  product_description   String?     @db.Text
  target_customers      String[]
  value_proposition     String?     @db.Text
  
  seeking               String[]    // Investment | Customer | Partner | Mentor
  
  // Traction metrics
  mrr_min               Decimal?    @db.Decimal(15, 2)
  mrr_max               Decimal?    @db.Decimal(15, 2)
  customer_count_min    Int?
  customer_count_max    Int?
  growth_rate           Decimal?    @db.Decimal(5, 2)
  
  oa                    BusinessOA  @relation(fields: [oa_id], references: [id])
  
  @@map("startup_profiles")
}

model InvestorProfile {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id                 String      @unique @db.Uuid
  
  investor_type         String?     // VC | Angel | CVC | PE | Family Office
  
  fund_size_min         Decimal?    @db.Decimal(15, 2)
  fund_size_max         Decimal?    @db.Decimal(15, 2)
  ticket_size_min       Decimal?    @db.Decimal(15, 2)
  ticket_size_max       Decimal?    @db.Decimal(15, 2)
  ticket_currency       String?     @default("USD")
  portfolio_count       Int?
  
  investment_thesis     String?     @db.Text
  target_stages         String[]
  target_industries     String[]
  target_regions        String[]
  
  actively_investing    Boolean     @default(true)
  
  oa                    BusinessOA  @relation(fields: [oa_id], references: [id])
  
  @@map("investor_profiles")
}

model SMEProfile {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id                 String      @unique @db.Uuid
  
  revenue_min           Decimal?    @db.Decimal(15, 2)
  revenue_max           Decimal?    @db.Decimal(15, 2)
  revenue_currency      String?     @default("USD")
  years_in_business     Int?
  
  core_services         String[]
  certifications        String[]
  notable_clients       String[]
  
  seeking               String[]    // DigitalTransformation | NewMarket | Partner | Supplier
  
  annual_tech_budget_min Decimal?   @db.Decimal(15, 2)
  annual_tech_budget_max Decimal?   @db.Decimal(15, 2)
  decision_timeline     String?     // Immediate | Quarter | Year
  
  oa                    BusinessOA  @relation(fields: [oa_id], references: [id])
  
  @@map("sme_profiles")
}

model ResearcherProfile {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id                 String      @unique @db.Uuid
  
  org_type              String?     // University | Institute | Consulting | Independent
  research_areas        String[]
  data_interests        String[]
  research_purpose      String?     @db.Text
  
  accreditations        String[]
  ethical_clearance     Boolean     @default(false)
  
  oa                    BusinessOA  @relation(fields: [oa_id], references: [id])
  
  @@map("researcher_profiles")
}
```

#### Project & Feed

```prisma
model Project {
  id                String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id             String          @db.Uuid
  
  // Basic info
  title             String
  slug              String          @unique
  description       String?         @db.Text
  cover_image_url   String?
  
  // Classification
  project_type      ProjectType
  industries        String[]
  technologies      String[]
  
  // Timeline
  status            ProjectStatus   @default(DRAFT)
  start_date        DateTime?
  end_date          DateTime?
  
  // Visibility
  visibility        DataTier        @default(PUBLIC)
  
  // Engagement metrics
  view_count        Int             @default(0)
  save_count        Int             @default(0)
  inquiry_count     Int             @default(0)
  
  // System
  created_at        DateTime        @default(now())
  updated_at        DateTime        @updatedAt
  
  // Relations
  oa                BusinessOA      @relation(fields: [oa_id], references: [id])
  milestones        ProjectMilestone[]
  documents         ProjectDocument[]
  
  @@index([oa_id])
  @@index([status])
  @@index([project_type])
  @@map("projects")
}

model ProjectMilestone {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id      String      @db.Uuid
  
  title           String
  description     String?     @db.Text
  achieved_at     DateTime
  metrics         Json?       // { key: value } for metrics
  
  created_at      DateTime    @default(now())
  
  project         Project     @relation(fields: [project_id], references: [id])
  
  @@map("project_milestones")
}

model ProjectDocument {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  project_id      String      @db.Uuid
  
  title           String
  document_type   String      // pitch_deck | financial | legal | technical
  storage_path    String
  visibility      DataTier    @default(PUBLIC)
  
  created_at      DateTime    @default(now())
  
  project         Project     @relation(fields: [project_id], references: [id])
  
  @@map("project_documents")
}
```

#### Data Vault (3-Tier Security)

```prisma
model DataVault {
  id                String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id             String      @unique @db.Uuid
  
  // Tier 1: Public content configured via OA profile + Projects
  
  // Tier 2: Protected
  detailed_profile_path   String?
  pricing_overview_path   String?
  client_list             String[]
  
  // Tier 3: Confidential
  nda_required            Boolean   @default(true)
  
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt
  
  oa                      BusinessOA @relation(fields: [oa_id], references: [id])
  access_requests         DataAccessRequest[]
  confidential_documents  ConfidentialDocument[]
  
  @@map("data_vaults")
}

model ConfidentialDocument {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  vault_id        String      @db.Uuid
  
  title           String
  document_type   String      // financial | cap_table | strategic | proprietary
  storage_path    String
  
  created_at      DateTime    @default(now())
  
  vault           DataVault   @relation(fields: [vault_id], references: [id])
  
  @@map("confidential_documents")
}

model DataAccessRequest {
  id                String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  vault_id          String            @db.Uuid
  requester_oa_id   String            @db.Uuid
  
  tier              DataTier
  purpose           String            @db.Text
  
  status            DataAccessStatus  @default(PENDING)
  
  // NDA for Tier 3
  nda_signed        Boolean           @default(false)
  nda_signed_at     DateTime?
  nda_document_path String?
  
  // Approval
  approved_by       String?           @db.Uuid
  approved_at       DateTime?
  rejection_reason  String?
  
  // Validity
  valid_from        DateTime?
  valid_until       DateTime?
  
  created_at        DateTime          @default(now())
  updated_at        DateTime          @updatedAt
  
  vault             DataVault         @relation(fields: [vault_id], references: [id])
  access_logs       DataAccessLog[]
  
  @@map("data_access_requests")
}

model DataAccessLog {
  id                String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  request_id        String      @db.Uuid
  accessor_user_id  String      @db.Uuid
  
  document_id       String?     @db.Uuid
  document_type     String?
  
  action            String      // view | download | share
  ip_address        String?
  user_agent        String?
  
  accessed_at       DateTime    @default(now())
  
  request           DataAccessRequest @relation(fields: [request_id], references: [id])
  
  @@map("data_access_logs")
}
```

#### Events & Booking

```prisma
model Event {
  id                    String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizer_oa_id       String          @db.Uuid
  
  // Basic info
  title                 String
  slug                  String          @unique
  description           String?         @db.Text
  cover_image_url       String?
  
  // Type & Format
  event_type            EventType
  format                EventFormat
  
  // Schedule
  start_time            DateTime
  end_time              DateTime
  timezone              String          @default("Asia/Ho_Chi_Minh")
  
  // Location
  venue_name            String?
  venue_address         String?
  meeting_url           String?
  
  // Capacity
  max_attendees         Int?
  registration_deadline DateTime?
  requires_approval     Boolean         @default(false)
  
  // Targeting
  target_oa_types       OAType[]
  target_industries     String[]
  
  // Status
  is_published          Boolean         @default(false)
  is_cancelled          Boolean         @default(false)
  
  // System
  created_at            DateTime        @default(now())
  updated_at            DateTime        @updatedAt
  
  // Relations
  organizer             BusinessOA      @relation("EventOrganizer", fields: [organizer_oa_id], references: [id])
  registrations         EventRegistration[]
  
  @@index([organizer_oa_id])
  @@index([start_time])
  @@map("events")
}

model EventRegistration {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  event_id        String      @db.Uuid
  attendee_oa_id  String      @db.Uuid
  registered_by   String      @db.Uuid  // User who registered
  
  status          String      @default("pending")  // pending | approved | rejected | attended | no_show
  
  notes           String?
  approved_at     DateTime?
  attended_at     DateTime?
  
  created_at      DateTime    @default(now())
  
  event           Event       @relation(fields: [event_id], references: [id])
  attendee_oa     BusinessOA  @relation(fields: [attendee_oa_id], references: [id])
  
  @@unique([event_id, attendee_oa_id])
  @@map("event_registrations")
}

model CalendarSlot {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id           String      @db.Uuid
  user_id         String      @db.Uuid
  
  start_time      DateTime
  end_time        DateTime
  
  is_available    Boolean     @default(true)
  is_recurring    Boolean     @default(false)
  recurrence_rule String?     // RRULE format
  
  created_at      DateTime    @default(now())
  
  @@index([oa_id, start_time])
  @@map("calendar_slots")
}

model Booking {
  id                  String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  requester_oa_id     String          @db.Uuid
  target_oa_id        String          @db.Uuid
  requester_user_id   String          @db.Uuid
  
  // Purpose
  purpose             String          // Explore | FollowUp | Demo | NDA Discussion
  message             String?         @db.Text
  
  // Reference (what triggered this booking)
  reference_type      String?         // Project | Event | Match
  reference_id        String?         @db.Uuid
  
  // Scheduling
  proposed_times      Json            // Array of proposed time slots
  confirmed_time      DateTime?
  duration_minutes    Int             @default(30)
  format              String          @default("online") // online | offline | phone
  
  // Meeting details
  meeting_link        String?
  venue               String?
  
  status              BookingStatus   @default(PENDING)
  
  // Feedback
  completed_at        DateTime?
  
  created_at          DateTime        @default(now())
  updated_at          DateTime        @updatedAt
  
  requester_oa        BusinessOA      @relation("BookingRequester", fields: [requester_oa_id], references: [id])
  target_oa           BusinessOA      @relation("BookingTarget", fields: [target_oa_id], references: [id])
  feedback            BookingFeedback[]
  
  @@map("bookings")
}

model BookingFeedback {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  booking_id      String      @db.Uuid
  from_oa_id      String      @db.Uuid
  
  rating          Int         // 1-5
  was_valuable    Boolean
  would_meet_again Boolean
  notes           String?     @db.Text  // Private
  
  created_at      DateTime    @default(now())
  
  booking         Booking     @relation(fields: [booking_id], references: [id])
  
  @@unique([booking_id, from_oa_id])
  @@map("booking_feedback")
}
```

#### Trust & Reputation

```prisma
model TrustScore {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id                 String      @db.Uuid
  
  // Component scores (0-25 each)
  identity_score        Int         @default(0)
  transparency_score    Int         @default(0)
  execution_score       Int         @default(0)
  community_score       Int         @default(0)
  
  // Total (0-100)
  total_score           Int         @default(0)
  level                 TrustLevel  @default(NEWCOMER)
  
  calculated_at         DateTime    @default(now())
  
  @@unique([oa_id])
  @@map("trust_scores")
}

model TrustScoreHistory {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id           String      @db.Uuid
  
  total_score     Int
  level           TrustLevel
  
  change_reason   String?     // What triggered the change
  
  recorded_at     DateTime    @default(now())
  
  @@index([oa_id, recorded_at])
  @@map("trust_score_history")
}

model TrustBadge {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  name            String      @unique
  description     String
  category        String      // identity | transparency | execution | community | special
  tier            String      // bronze | silver | gold | platinum
  icon            String
  
  // Requirements (JSON for flexibility)
  requirements    Json
  
  created_at      DateTime    @default(now())
  
  oas             OABadge[]
  
  @@map("trust_badges")
}

model OABadge {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id           String      @db.Uuid
  badge_id        String      @db.Uuid
  
  awarded_at      DateTime    @default(now())
  awarded_reason  String?
  
  oa              BusinessOA  @relation(fields: [oa_id], references: [id])
  badge           TrustBadge  @relation(fields: [badge_id], references: [id])
  
  @@unique([oa_id, badge_id])
  @@map("oa_badges")
}

model Vouch {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  voucher_oa_id         String      @db.Uuid
  vouchee_oa_id         String      @db.Uuid
  
  relationship          String      // Client | Partner | Investor | Colleague
  relationship_duration String?     // e.g., "2 years"
  
  vouch_type            String      // Capability | Character | Both
  capabilities_vouched  String[]
  testimonial           String?     @db.Text
  
  // Verification
  is_mutual             Boolean     @default(false)
  verified_via          String?     // ProjectCollaboration | EventMeeting | External
  
  // Validity
  is_active             Boolean     @default(true)
  expires_at            DateTime
  
  created_at            DateTime    @default(now())
  
  voucher               BusinessOA  @relation("VouchGiver", fields: [voucher_oa_id], references: [id])
  vouchee               BusinessOA  @relation("VouchReceiver", fields: [vouchee_oa_id], references: [id])
  
  @@unique([voucher_oa_id, vouchee_oa_id])
  @@map("vouches")
}

model BusinessSpotlight {
  id                String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  oa_id             String      @db.Uuid
  
  type              String      // WeeklyFeature | SuccessStory | ThoughtLeader
  
  title             String
  story             String      @db.Text
  media_urls        String[]
  
  // Display
  featured_locations String[]   // Homepage | Feed | Newsletter
  feature_start     DateTime
  feature_end       DateTime
  
  // Engagement
  view_count        Int         @default(0)
  reaction_count    Int         @default(0)
  share_count       Int         @default(0)
  
  // Selection
  selected_by       String      @db.Uuid
  selection_reason  String?
  
  created_at        DateTime    @default(now())
  
  @@map("business_spotlights")
}
```

#### Matching

```prisma
model MatchSuggestion {
  id                String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  source_oa_id      String        @db.Uuid
  target_oa_id      String        @db.Uuid
  
  match_score       Int           // 0-100
  match_type        String        // Customer | Investor | Partner | Supplier
  match_reasons     Json          // Array of { type, description, weight }
  
  status            MatchStatus   @default(NEW)
  
  // Urgency
  expires_at        DateTime
  
  created_at        DateTime      @default(now())
  updated_at        DateTime      @updatedAt
  
  source_oa         BusinessOA    @relation("MatchSource", fields: [source_oa_id], references: [id])
  target_oa         BusinessOA    @relation("MatchTarget", fields: [target_oa_id], references: [id])
  
  @@unique([source_oa_id, target_oa_id])
  @@index([source_oa_id, status])
  @@map("match_suggestions")
}

model Interaction {
  id                String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  actor_oa_id       String      @db.Uuid
  
  target_type       String      // Project | OAProfile | Event
  target_id         String      @db.Uuid
  
  action            String      // View | Save | Share | Inquire | Book
  
  source            String      // Feed | Search | Suggestion | Event
  session_id        String?
  
  created_at        DateTime    @default(now())
  
  @@index([actor_oa_id])
  @@index([target_type, target_id])
  @@map("interactions")
}
```

#### Notifications & Audit

```prisma
model Notification {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id         String      @db.Uuid
  
  type            String      // booking_request | data_access | event_reminder | match_suggestion | etc
  title           String
  message         String
  
  // Reference
  reference_type  String?
  reference_id    String?     @db.Uuid
  
  // Status
  is_read         Boolean     @default(false)
  read_at         DateTime?
  
  created_at      DateTime    @default(now())
  
  @@index([user_id, is_read])
  @@map("notifications")
}

model AuditLog {
  id              String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  
  actor_user_id   String?     @db.Uuid
  actor_oa_id     String?     @db.Uuid
  
  action          String      // create | update | delete | login | etc
  entity_type     String      // User | OA | Project | Event | etc
  entity_id       String?     @db.Uuid
  
  payload_before  Json?
  payload_after   Json?
  
  ip_address      String?
  user_agent      String?
  
  created_at      DateTime    @default(now())
  
  actor           User?       @relation("AuditActor", fields: [actor_user_id], references: [id])
  
  @@index([entity_type, entity_id])
  @@index([actor_user_id])
  @@index([created_at])
  @@map("audit_logs")
}
```

---

## 3. API Architecture

### 3.1. Module Structure (NestJS)

```
src/
├── main.ts                     # Bootstrap, global prefix /api
├── app.module.ts               # Root module
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts      # /auth/*
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       └── token.dto.ts
│
├── oa/
│   ├── oa.module.ts
│   ├── oa.controller.ts        # /oa/*
│   ├── oa.service.ts
│   ├── membership.controller.ts # /oa/:id/members/*
│   └── dto/
│
├── projects/
│   ├── projects.module.ts
│   ├── projects.controller.ts   # /projects/*
│   ├── projects.service.ts
│   └── feed.service.ts          # AI Feed algorithm
│
├── data-vault/
│   ├── data-vault.module.ts
│   ├── data-vault.controller.ts # /data-vault/*
│   ├── data-vault.service.ts
│   └── access.guard.ts          # Tier access guard
│
├── events/
│   ├── events.module.ts
│   ├── events.controller.ts     # /events/*
│   ├── events.service.ts
│   └── registrations.service.ts
│
├── bookings/
│   ├── bookings.module.ts
│   ├── bookings.controller.ts   # /bookings/*
│   ├── bookings.service.ts
│   └── calendar.service.ts
│
├── matching/
│   ├── matching.module.ts
│   ├── matching.controller.ts   # /matching/*
│   ├── matching.service.ts
│   └── scoring.service.ts       # Match scoring algorithm
│
├── trust/
│   ├── trust.module.ts
│   ├── trust.controller.ts      # /trust/*
│   ├── trust.service.ts
│   ├── badge.service.ts
│   └── vouch.service.ts
│
├── notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   └── notifications.gateway.ts  # WebSocket
│
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts      # /admin/*
│   └── admin.service.ts
│
└── common/
    ├── guards/
    ├── interceptors/
    │   └── audit-log.interceptor.ts
    ├── decorators/
    │   ├── current-user.decorator.ts
    │   └── roles.decorator.ts
    └── filters/
```

### 3.2. API Endpoints

#### Auth Module (`/api/auth`)

```typescript
// auth.controller.ts

@Controller('auth')
export class AuthController {
  
  @Post('register')
  @Public()
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    // Validate email domain (not in blocked list)
    // Create user with email_verified = false
    // Send verification email
    // Return user (without tokens until verified)
  }
  
  @Post('verify-email')
  @Public()
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<AuthResponse> {
    // Validate token
    // Set email_verified = true
    // Return user + tokens
  }
  
  @Post('resend-verification')
  @Public()
  async resendVerification(@Body() dto: ResendDto): Promise<void> {
    // Check user exists, not verified
    // Rate limit (1 per minute)
    // Send new verification email
  }
  
  @Post('login')
  @Public()
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    // Validate credentials
    // Check email_verified
    // Return user + tokens
  }
  
  @Post('refresh')
  @Public()
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
    // Validate refresh token
    // Return new access token
  }
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: User): Promise<UserResponse> {
    // Return current user with OA memberships
  }
  
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() dto: LogoutDto): Promise<void> {
    // Revoke refresh token
  }
}
```

#### OA Module (`/api/oa`)

```typescript
// oa.controller.ts

@Controller('oa')
@UseGuards(JwtAuthGuard)
export class OAController {
  
  @Post()
  async createOA(@CurrentUser() user: User, @Body() dto: CreateOADto): Promise<OAResponse> {
    // Create OA with user as OWNER
    // Create type-specific profile
    // Set user's primary_oa_id
  }
  
  @Get('my')
  async getMyOAs(@CurrentUser() user: User): Promise<OAResponse[]> {
    // Return all OAs user is member of
  }
  
  @Get(':id')
  async getOA(@Param('id') id: string, @CurrentUser() user: User): Promise<OAResponse> {
    // Return OA details (public tier)
    // Include type-specific profile
  }
  
  @Patch(':id')
  @UseGuards(OARoleGuard([OARole.OWNER, OARole.ADMIN]))
  async updateOA(@Param('id') id: string, @Body() dto: UpdateOADto): Promise<OAResponse> {
    // Update OA profile
    // Audit log
  }
  
  @Post(':id/switch')
  async switchOA(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    // Set user's primary_oa_id
  }
}

// membership.controller.ts

@Controller('oa/:oaId/members')
@UseGuards(JwtAuthGuard, OARoleGuard([OARole.OWNER, OARole.ADMIN]))
export class MembershipController {
  
  @Get()
  async getMembers(@Param('oaId') oaId: string): Promise<MemberResponse[]> {}
  
  @Post('invite')
  async invite(@Param('oaId') oaId: string, @Body() dto: InviteDto): Promise<void> {
    // Send invitation email
    // Create pending membership
  }
  
  @Delete(':userId')
  async removeMember(@Param('oaId') oaId: string, @Param('userId') userId: string): Promise<void> {}
  
  @Patch(':userId/role')
  @UseGuards(OARoleGuard([OARole.OWNER]))  // Only owner can change roles
  async changeRole(@Body() dto: ChangeRoleDto): Promise<void> {}
}
```

#### Projects Module (`/api/projects`)

```typescript
// projects.controller.ts

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  
  @Post()
  @UseGuards(OAMemberGuard)
  async create(@CurrentOA() oa: BusinessOA, @Body() dto: CreateProjectDto): Promise<ProjectResponse> {
    // Create project for current OA
    // Default status = DRAFT
  }
  
  @Get()
  async getFeed(@CurrentOA() oa: BusinessOA, @Query() query: FeedQueryDto): Promise<PaginatedResponse<ProjectResponse>> {
    // AI-driven feed based on OA profile
    // Filter by industry, type, etc.
    // Track view interactions
  }
  
  @Get(':id')
  async getProject(@Param('id') id: string, @CurrentUser() user: User): Promise<ProjectResponse> {
    // Return project (public tier by default)
    // Include milestones
    // Track view interaction
  }
  
  @Patch(':id')
  @UseGuards(ProjectOwnerGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto): Promise<ProjectResponse> {}
  
  @Patch(':id/publish')
  @UseGuards(ProjectOwnerGuard)
  async publish(@Param('id') id: string): Promise<ProjectResponse> {
    // Set status = PUBLISHED
    // Validate required fields
  }
  
  @Delete(':id')
  @UseGuards(ProjectOwnerGuard)
  async delete(@Param('id') id: string): Promise<void> {
    // Soft delete (archive) or hard delete
  }
  
  @Post(':id/milestones')
  @UseGuards(ProjectOwnerGuard)
  async addMilestone(@Param('id') id: string, @Body() dto: CreateMilestoneDto): Promise<MilestoneResponse> {}
}
```

#### Data Vault Module (`/api/data-vault`)

```typescript
// data-vault.controller.ts

@Controller('data-vault')
@UseGuards(JwtAuthGuard)
export class DataVaultController {
  
  @Get('oa/:oaId')
  async getOAData(
    @Param('oaId') oaId: string,
    @CurrentOA() requesterOA: BusinessOA
  ): Promise<DataVaultResponse> {
    // Return Tier 1 (public) by default
    // Include Tier 2 if access granted
    // Include Tier 3 if NDA signed + access granted
  }
  
  @Post('oa/:oaId/request')
  @UseGuards(VerifiedOAGuard)
  async requestAccess(
    @Param('oaId') oaId: string,
    @Body() dto: RequestAccessDto  // { tier, purpose }
  ): Promise<AccessRequestResponse> {
    // Create data access request
    // For Tier 3: Require NDA signing flow
    // Notify target OA
  }
  
  @Get('requests')
  async getMyRequests(@CurrentOA() oa: BusinessOA): Promise<AccessRequestResponse[]> {
    // Return requests made by my OA
  }
  
  @Get('incoming-requests')
  @UseGuards(OARoleGuard([OARole.OWNER, OARole.ADMIN]))
  async getIncomingRequests(@CurrentOA() oa: BusinessOA): Promise<AccessRequestResponse[]> {
    // Return requests to my OA's data
  }
  
  @Patch('requests/:id')
  @UseGuards(OARoleGuard([OARole.OWNER, OARole.ADMIN]))
  async respondToRequest(
    @Param('id') id: string,
    @Body() dto: RespondAccessDto  // { status, validUntil?, rejectionReason? }
  ): Promise<AccessRequestResponse> {
    // Approve/Reject request
    // Set validity period
    // Notify requester
  }
  
  @Get('access-log')
  @UseGuards(OARoleGuard([OARole.OWNER, OARole.ADMIN]))
  async getAccessLog(@CurrentOA() oa: BusinessOA): Promise<AccessLogResponse[]> {
    // Return who accessed my data
  }
}
```

#### Events Module (`/api/events`)

```typescript
// events.controller.ts

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  
  @Post()
  @UseGuards(OAMemberGuard)
  async create(@CurrentOA() oa: BusinessOA, @Body() dto: CreateEventDto): Promise<EventResponse> {}
  
  @Get()
  async list(@CurrentOA() oa: BusinessOA, @Query() query: EventQueryDto): Promise<PaginatedResponse<EventResponse>> {
    // List events with AI recommendations
    // Filter by type, date, etc.
  }
  
  @Get(':id')
  async getEvent(@Param('id') id: string): Promise<EventResponse> {
    // Include registrations count
    // Include recommended attendees (for organizer)
  }
  
  @Patch(':id')
  @UseGuards(EventOrganizerGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateEventDto): Promise<EventResponse> {}
  
  @Patch(':id/publish')
  @UseGuards(EventOrganizerGuard)
  async publish(@Param('id') id: string): Promise<EventResponse> {
    // Set is_published = true
    // Notify matched OAs
  }
  
  @Post(':id/register')
  @UseGuards(VerifiedOAGuard)
  async register(@Param('id') id: string, @CurrentOA() oa: BusinessOA): Promise<RegistrationResponse> {
    // Create registration (pending if requires approval)
    // Notify organizer if needs approval
  }
  
  @Get(':id/registrations')
  @UseGuards(EventOrganizerGuard)
  async getRegistrations(@Param('id') id: string): Promise<RegistrationResponse[]> {}
  
  @Patch(':eventId/registrations/:regId')
  @UseGuards(EventOrganizerGuard)
  async respondRegistration(
    @Param('regId') regId: string,
    @Body() dto: RespondRegistrationDto
  ): Promise<RegistrationResponse> {
    // Approve/Reject
    // Notify attendee
  }
}
```

#### Bookings Module (`/api/bookings`)

```typescript
// bookings.controller.ts

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  
  @Get('users/:userId/availability')
  async getAvailability(
    @Param('userId') userId: string,
    @Query() query: AvailabilityQueryDto  // { startDate, endDate }
  ): Promise<AvailabilityResponse> {
    // Return available slots
  }
  
  @Post()
  @UseGuards(VerifiedOAGuard)
  async create(@CurrentOA() oa: BusinessOA, @Body() dto: CreateBookingDto): Promise<BookingResponse> {
    // Create booking request
    // Notify target
    // Send calendar invite (if auto-confirmed)
  }
  
  @Get()
  async list(@CurrentOA() oa: BusinessOA, @Query() query: BookingQueryDto): Promise<PaginatedResponse<BookingResponse>> {
    // List my bookings (sent + received)
  }
  
  @Get(':id')
  async getBooking(@Param('id') id: string): Promise<BookingResponse> {}
  
  @Patch(':id/respond')
  async respond(@Param('id') id: string, @Body() dto: RespondBookingDto): Promise<BookingResponse> {
    // Confirm/Decline/Reschedule
    // Generate meeting link if online
    // Sync to calendar
    // Notify requester
  }
  
  @Post(':id/feedback')
  async submitFeedback(@Param('id') id: string, @Body() dto: FeedbackDto): Promise<void> {
    // Save feedback
    // Update trust scores
  }
}
```

#### Matching Module (`/api/matching`)

```typescript
// matching.controller.ts

@Controller('matching')
@UseGuards(JwtAuthGuard, VerifiedOAGuard)
export class MatchingController {
  
  @Get('suggestions')
  async getSuggestions(@CurrentOA() oa: BusinessOA): Promise<MatchSuggestionResponse[]> {
    // Return AI-generated match suggestions
    // Include match reasons
    // Apply daily limit by trust level
  }
  
  @Post('suggestions/:id/save')
  async save(@Param('id') id: string): Promise<void> {
    // Update status to SAVED
  }
  
  @Post('suggestions/:id/dismiss')
  async dismiss(@Param('id') id: string): Promise<void> {
    // Update status to DISMISSED
  }
  
  @Post('suggestions/:id/connect')
  async connect(@Param('id') id: string, @Body() dto: ConnectDto): Promise<BookingResponse> {
    // Update status to CONNECTED
    // Create booking request
  }
}
```

#### Trust Module (`/api/trust`)

```typescript
// trust.controller.ts

@Controller('trust')
@UseGuards(JwtAuthGuard)
export class TrustController {
  
  @Get('oa/:oaId/score')
  async getScore(@Param('oaId') oaId: string): Promise<TrustScoreResponse> {
    // Return trust score with component breakdown
  }
  
  @Get('oa/:oaId/badges')
  async getBadges(@Param('oaId') oaId: string): Promise<BadgeResponse[]> {
    // Return awarded badges
  }
  
  @Post('oa/:oaId/vouch')
  @UseGuards(TrustedOAGuard)  // Trust Score >= 50
  async vouch(@Param('oaId') oaId: string, @Body() dto: VouchDto): Promise<VouchResponse> {
    // Validate eligibility (interaction exists, not exceeded limit)
    // Create vouch
    // Update vouchee trust score
    // Notify vouchee
  }
  
  @Get('oa/:oaId/vouches')
  async getVouches(@Param('oaId') oaId: string): Promise<VouchResponse[]> {
    // Return vouches received
  }
  
  @Get('spotlights')
  async getSpotlights(@Query() query: SpotlightQueryDto): Promise<SpotlightResponse[]> {
    // Return featured businesses
  }
}
```

---

## 4. Security Implementation

### 4.1. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REGISTER                                                        │
│  ────────                                                        │
│  Client ─── POST /auth/register ──────────────────────► API     │
│         ◄── 201 { user } (no tokens) ─────────────────          │
│                                                                  │
│  [Email sent with verification link]                             │
│                                                                  │
│  VERIFY EMAIL                                                    │
│  ────────────                                                    │
│  Client ─── POST /auth/verify-email { token } ────────► API     │
│         ◄── 200 { user, accessToken, refreshToken } ──          │
│                                                                  │
│  LOGIN                                                           │
│  ─────                                                           │
│  Client ─── POST /auth/login { email, password } ─────► API     │
│         ◄── 200 { user, accessToken, refreshToken } ──          │
│                                                                  │
│  API REQUEST (with token)                                        │
│  ────────────────────────                                        │
│  Client ─── GET /api/* ───────────────────────────────► API     │
│             Header: Authorization: Bearer <accessToken>          │
│         ◄── 200 { data } ─────────────────────────────          │
│                                                                  │
│  REFRESH                                                         │
│  ───────                                                         │
│  Client ─── POST /auth/refresh { refreshToken } ──────► API     │
│         ◄── 200 { accessToken, refreshToken } ────────          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. JWT Structure

```typescript
// Access Token Payload (expires: 15 minutes)
{
  sub: "user-uuid",
  email: "user@company.com",
  primary_oa_id: "oa-uuid" | null,
  iat: 1234567890,
  exp: 1234568790
}

// Refresh Token Payload (expires: 7 days)
{
  sub: "user-uuid",
  jti: "token-uuid",  // For revocation
  iat: 1234567890,
  exp: 1235172690
}
```

### 4.3. Rate Limiting

```typescript
// config/rate-limit.config.ts

export const RATE_LIMITS = {
  // By Trust Level
  NEWCOMER: { windowMs: 60000, max: 50 },
  VERIFIED: { windowMs: 60000, max: 100 },
  TRUSTED: { windowMs: 60000, max: 200 },
  ELITE: { windowMs: 60000, max: 500 },
  
  // Specific endpoints
  AUTH: { windowMs: 60000, max: 5 },        // Login attempts
  VERIFY_EMAIL: { windowMs: 60000, max: 1 }, // Resend verification
  MATCHING: { windowMs: 86400000, max: 30 }, // Match suggestions per day
};
```

### 4.4. Data Access Control

```typescript
// guards/tier-access.guard.ts

@Injectable()
export class TierAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { targetOAId, tier } = request.params;
    const requesterOA = request.currentOA;
    
    if (tier === DataTier.PUBLIC) {
      return true;
    }
    
    // Check if requester has approved access
    const access = await this.dataVaultService.checkAccess(
      requesterOA.id,
      targetOAId,
      tier
    );
    
    if (!access) {
      throw new ForbiddenException('Access not granted');
    }
    
    if (access.valid_until < new Date()) {
      throw new ForbiddenException('Access expired');
    }
    
    // Log access
    await this.dataVaultService.logAccess({
      requestId: access.id,
      accessorUserId: request.user.id,
      action: 'view',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    });
    
    return true;
  }
}
```

---

## 5. AI/ML Components

### 5.1. Feed Ranking Algorithm

```typescript
// services/feed.service.ts

@Injectable()
export class FeedService {
  
  async getPersonalizedFeed(oa: BusinessOA, options: FeedOptions): Promise<Project[]> {
    // 1. Get candidate projects
    const candidates = await this.projectsRepo.findPublished({
      excludeOAId: oa.id,
      limit: 1000
    });
    
    // 2. Calculate scores for each candidate
    const scored = await Promise.all(
      candidates.map(async (project) => {
        const score = await this.calculateFeedScore(oa, project);
        return { project, score };
      })
    );
    
    // 3. Sort by score
    scored.sort((a, b) => b.score - a.score);
    
    // 4. Apply pagination
    return scored
      .slice(options.offset, options.offset + options.limit)
      .map(s => s.project);
  }
  
  private async calculateFeedScore(viewer: BusinessOA, project: Project): Promise<number> {
    let score = 0;
    
    // Industry overlap (25%)
    const industryMatch = this.calculateIndustryMatch(viewer, project);
    score += industryMatch * 25;
    
    // Need-capability match (30%)
    const needMatch = await this.calculateNeedCapabilityMatch(viewer, project);
    score += needMatch * 30;
    
    // Geography (10%)
    const geoMatch = this.calculateGeoMatch(viewer, project);
    score += geoMatch * 10;
    
    // Trust score (15%)
    const trustScore = project.oa.trust_score / 100;
    score += trustScore * 15;
    
    // Stage compatibility (10%)
    const stageMatch = this.calculateStageMatch(viewer, project);
    score += stageMatch * 10;
    
    // Network proximity (10%)
    const networkScore = await this.calculateNetworkProximity(viewer, project.oa);
    score += networkScore * 10;
    
    // Recency boost (decay over time)
    const daysSinceUpdate = (Date.now() - project.updated_at.getTime()) / 86400000;
    const recencyMultiplier = Math.exp(-daysSinceUpdate / 30); // Decay over 30 days
    score *= recencyMultiplier;
    
    return score;
  }
}
```

### 5.2. Match Suggestion Engine

```typescript
// services/matching.service.ts

@Injectable()
export class MatchingService {
  
  async generateSuggestions(oa: BusinessOA): Promise<MatchSuggestion[]> {
    // 1. Get potential matches based on OA type
    const candidates = await this.getCandidates(oa);
    
    // 2. Score each candidate
    const scored = await Promise.all(
      candidates.map(async (target) => {
        const { score, reasons, matchType } = await this.calculateMatchScore(oa, target);
        return { target, score, reasons, matchType };
      })
    );
    
    // 3. Filter by minimum score (50%)
    const qualified = scored.filter(s => s.score >= 50);
    
    // 4. Sort and limit
    qualified.sort((a, b) => b.score - a.score);
    const limited = this.applyDailyLimit(oa, qualified);
    
    // 5. Create/update suggestions
    return Promise.all(
      limited.map(s => this.upsertSuggestion({
        sourceOAId: oa.id,
        targetOAId: s.target.id,
        matchScore: s.score,
        matchType: s.matchType,
        matchReasons: s.reasons,
        expiresAt: addDays(new Date(), 7) // 7 day expiry
      }))
    );
  }
  
  private async calculateMatchScore(source: BusinessOA, target: BusinessOA) {
    const reasons: MatchReason[] = [];
    let score = 0;
    
    // Industry analysis
    const industryScore = this.analyzeIndustryFit(source, target);
    if (industryScore > 0.5) {
      reasons.push({
        type: 'industry',
        description: `Cùng ngành ${this.getIndustryNames(source, target)}`,
        weight: industryScore
      });
    }
    score += industryScore * 25;
    
    // Seeking-offering match
    const seekingMatch = this.analyzeSeekingMatch(source, target);
    if (seekingMatch.score > 0.5) {
      reasons.push({
        type: 'need_match',
        description: seekingMatch.description,
        weight: seekingMatch.score
      });
    }
    score += seekingMatch.score * 30;
    
    // ... other factors
    
    // Determine match type
    const matchType = this.determineMatchType(source, target, reasons);
    
    return { score, reasons, matchType };
  }
}
```

### 5.3. Trust Score Calculator

```typescript
// services/trust.service.ts

@Injectable()
export class TrustService {
  
  async calculateTrustScore(oaId: string): Promise<TrustScore> {
    const oa = await this.oaRepo.findWithRelations(oaId);
    
    // Identity Score (0-25)
    const identityScore = this.calculateIdentityScore(oa);
    
    // Transparency Score (0-25)
    const transparencyScore = await this.calculateTransparencyScore(oa);
    
    // Execution Score (0-25)
    const executionScore = await this.calculateExecutionScore(oa);
    
    // Community Score (0-25)
    const communityScore = await this.calculateCommunityScore(oa);
    
    const totalScore = identityScore + transparencyScore + executionScore + communityScore;
    const level = this.determineLevel(totalScore);
    
    return this.upsertTrustScore({
      oaId,
      identityScore,
      transparencyScore,
      executionScore,
      communityScore,
      totalScore,
      level
    });
  }
  
  private calculateIdentityScore(oa: BusinessOA): number {
    let score = 0;
    
    // Email verified (+5)
    if (oa.members.some(m => m.user.email_verified)) score += 5;
    
    // OA verified (+10)
    if (oa.verification_status === 'VERIFIED') score += 10;
    
    // Tax code validated (+5)
    if (oa.tax_code && this.taxCodeValidated(oa.tax_code)) score += 5;
    
    // 2FA enabled (+5)
    if (oa.members.some(m => m.user.two_fa_enabled)) score += 5;
    
    return Math.min(score, 25);
  }
  
  private async calculateTransparencyScore(oa: BusinessOA): Promise<number> {
    let score = 0;
    
    // Profile completeness (+10 if >= 80%)
    const completeness = this.calculateProfileCompleteness(oa);
    if (completeness >= 0.8) score += 10;
    
    // Active projects (+5 if >= 2)
    const activeProjects = await this.projectsRepo.countActive(oa.id);
    if (activeProjects >= 2) score += 5;
    
    // Recent updates (+5 if < 30 days)
    const lastUpdate = await this.getLastUpdateDate(oa.id);
    if (this.daysSince(lastUpdate) < 30) score += 5;
    
    // Tier 2 data available (+5)
    if (oa.data_vault?.detailed_profile_path) score += 5;
    
    return Math.min(score, 25);
  }
  
  private determineLevel(score: number): TrustLevel {
    if (score >= 75) return 'ELITE';
    if (score >= 50) return 'TRUSTED';
    if (score >= 25) return 'VERIFIED';
    return 'NEWCOMER';
  }
}
```

---

## 6. Infrastructure

### 6.1. Docker Configuration

```yaml
# docker-compose.yml

version: '3.8'

services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/iec_hub
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - S3_ENDPOINT=${S3_ENDPOINT}
    depends_on:
      - db
      - redis
    
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - api
      
  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=iec_hub
    ports:
      - "5432:5432"
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  redis_data:
  es_data:
```

### 6.2. Environment Variables

```bash
# .env.example

# Database
DATABASE_URL=postgresql://user:pass@host:5432/iec_hub

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# S3/Storage
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=iec-hub-files
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM=noreply@iec-hub.com

# Frontend
VITE_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

---

## 7. Monitoring & Logging

### 7.1. Health Check Endpoint

```typescript
// health.controller.ts

@Controller('health')
export class HealthController {
  
  @Get()
  async check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
        storage: await this.checkStorage()
      }
    };
  }
}
```

### 7.2. Audit Log Interceptor

```typescript
// interceptors/audit-log.interceptor.ts

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(async (response) => {
        const auditableActions = ['POST', 'PUT', 'PATCH', 'DELETE'];
        
        if (auditableActions.includes(request.method)) {
          await this.auditService.log({
            actorUserId: request.user?.id,
            actorOAId: request.currentOA?.id,
            action: this.getAction(request),
            entityType: this.getEntityType(request),
            entityId: this.getEntityId(request, response),
            payloadBefore: request.body,
            payloadAfter: response,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            duration: Date.now() - startTime
          });
        }
      })
    );
  }
}
```

---

**Document Control:**
- Version: 4.0
- Last Updated: 22/03/2026
- Status: APPROVED
- Next Review: 22/04/2026

