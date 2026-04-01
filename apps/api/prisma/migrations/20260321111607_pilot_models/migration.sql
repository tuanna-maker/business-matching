-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('GUEST', 'REGISTERED', 'OA_VERIFIED');

-- CreateEnum
CREATE TYPE "OAType" AS ENUM ('STARTUP', 'INVESTOR', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'APPROVED', 'REJECTED', 'ATTENDED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "email_domain_blacklist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_domain_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "oa_type" "OAType" NOT NULL,
    "logo_url" TEXT,
    "description" TEXT,
    "website" TEXT,
    "company_email_domain" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT true,
    "verified_at" TIMESTAMPTZ(6),
    "industry" TEXT,
    "location" TEXT,
    "stage" TEXT,
    "funding_need" TEXT,
    "team_size" TEXT,
    "investment_focus" TEXT,
    "ticket_size_min" TEXT,
    "ticket_size_max" TEXT,
    "portfolio_count" TEXT,
    "company_size" TEXT,
    "innovation_needs" TEXT,
    "partnership_interest" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "organization_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilot_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "email_domain" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'GUEST',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMPTZ(6),
    "oa_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pilot_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_slots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_rule" TEXT,
    "booking_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calendar_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requester_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "proposed_time" TIMESTAMPTZ(6) NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "meeting_type" TEXT NOT NULL DEFAULT 'online',
    "meeting_link" TEXT,
    "location" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "slot_locked" BOOLEAN NOT NULL DEFAULT false,
    "reminder_24h_sent" BOOLEAN NOT NULL DEFAULT false,
    "reminder_1h_sent" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_at" TIMESTAMPTZ(6),
    "cancelled_at" TIMESTAMPTZ(6),
    "cancel_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creator_id" UUID NOT NULL,
    "oa_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "short_description" TEXT,
    "event_type" "EventType" NOT NULL DEFAULT 'ONLINE',
    "meeting_link" TEXT,
    "location" TEXT,
    "address" TEXT,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "max_attendees" INTEGER,
    "current_attendees" INTEGER NOT NULL DEFAULT 0,
    "cover_image_url" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "notes" TEXT,
    "reject_reason" TEXT,
    "added_to_calendar" BOOLEAN NOT NULL DEFAULT false,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_domain_blacklist_domain_key" ON "email_domain_blacklist"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "organization_accounts_oa_type_idx" ON "organization_accounts"("oa_type");

-- CreateIndex
CREATE INDEX "organization_accounts_company_email_domain_idx" ON "organization_accounts"("company_email_domain");

-- CreateIndex
CREATE UNIQUE INDEX "pilot_users_email_key" ON "pilot_users"("email");

-- CreateIndex
CREATE INDEX "pilot_users_email_idx" ON "pilot_users"("email");

-- CreateIndex
CREATE INDEX "pilot_users_email_domain_idx" ON "pilot_users"("email_domain");

-- CreateIndex
CREATE INDEX "pilot_users_status_idx" ON "pilot_users"("status");

-- CreateIndex
CREATE INDEX "pilot_users_oa_id_idx" ON "pilot_users"("oa_id");

-- CreateIndex
CREATE INDEX "calendar_slots_user_id_start_time_idx" ON "calendar_slots"("user_id", "start_time");

-- CreateIndex
CREATE INDEX "calendar_slots_user_id_is_available_idx" ON "calendar_slots"("user_id", "is_available");

-- CreateIndex
CREATE INDEX "booking_requests_requester_id_status_idx" ON "booking_requests"("requester_id", "status");

-- CreateIndex
CREATE INDEX "booking_requests_receiver_id_status_idx" ON "booking_requests"("receiver_id", "status");

-- CreateIndex
CREATE INDEX "booking_requests_proposed_time_idx" ON "booking_requests"("proposed_time");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_status_start_time_idx" ON "events"("status", "start_time");

-- CreateIndex
CREATE INDEX "events_slug_idx" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_oa_id_idx" ON "events"("oa_id");

-- CreateIndex
CREATE INDEX "events_creator_id_idx" ON "events"("creator_id");

-- CreateIndex
CREATE INDEX "event_registrations_event_id_status_idx" ON "event_registrations"("event_id", "status");

-- CreateIndex
CREATE INDEX "event_registrations_user_id_idx" ON "event_registrations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- AddForeignKey
ALTER TABLE "pilot_users" ADD CONSTRAINT "pilot_users_oa_id_fkey" FOREIGN KEY ("oa_id") REFERENCES "organization_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_slots" ADD CONSTRAINT "calendar_slots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pilot_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "pilot_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "pilot_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "pilot_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_oa_id_fkey" FOREIGN KEY ("oa_id") REFERENCES "organization_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "pilot_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
