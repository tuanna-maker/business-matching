-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateTable
CREATE TABLE "orgs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "org_type" TEXT,
    "logo_url" TEXT,
    "tax_id" TEXT,
    "website" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "org_id" UUID,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "avatar_url" TEXT,
    "user_type" TEXT NOT NULL,
    "approval_status" TEXT NOT NULL DEFAULT 'pending',
    "approved_at" TIMESTAMPTZ,
    "approved_by" UUID,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" UUID NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "startup_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "user_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_description" TEXT,
    "website" TEXT,
    "founded_year" INTEGER,
    "team_size" INTEGER,
    "location" TEXT,
    "industry" TEXT,
    "funding_stage" TEXT,
    "funding_amount" DECIMAL(65,30),
    "funding_currency" TEXT,
    "pitch_deck_url" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "startup_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investor_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "user_id" UUID NOT NULL,
    "company_name" TEXT NOT NULL,
    "company_description" TEXT,
    "website" TEXT,
    "founded_year" INTEGER,
    "team_size" INTEGER,
    "location" TEXT,
    "investment_focus" TEXT,
    "investment_stage" TEXT,
    "investment_amount_min" DECIMAL(65,30),
    "investment_amount_max" DECIMAL(65,30),
    "investment_currency" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "investor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "startup_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "stage" TEXT,
    "funding_need_amount" DECIMAL(65,30),
    "funding_currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "iec_level" TEXT,
    "hero_image_url" TEXT,
    "logo_url" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "interest_count" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "data_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_room_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "data_room_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "data_room_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_room_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "data_room_id" UUID NOT NULL,
    "requester_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "response_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "data_room_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "inviter_id" UUID NOT NULL,
    "invitee_email" TEXT NOT NULL,
    "role_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "org_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iec_levels" (
    "id" SERIAL NOT NULL,
    "org_id" UUID,
    "level" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "iec_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iec_criteria" (
    "id" SERIAL NOT NULL,
    "org_id" UUID,
    "iec_level_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weight" DECIMAL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "iec_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_iec_assessments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "project_id" UUID NOT NULL,
    "assessor_id" UUID NOT NULL,
    "target_level_id" INTEGER NOT NULL,
    "final_level_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'in_review',
    "comments" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "project_iec_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_iec_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "assessment_id" UUID NOT NULL,
    "criterion_id" INTEGER NOT NULL,
    "score" DECIMAL NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "project_iec_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_intents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "investor_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'liked',
    "source" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "match_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "project_id" UUID NOT NULL,
    "startup_id" UUID NOT NULL,
    "investor_id" UUID NOT NULL,
    "match_intent_id" UUID,
    "iec_level_at_match" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending_intro',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "match_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "old_status" TEXT,
    "new_status" TEXT,
    "actor_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "match_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "actor_id" UUID,
    "actor_type" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "payload_before" JSONB,
    "payload_after" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "recipient_user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "match_id" UUID NOT NULL,
    "participant1_id" UUID NOT NULL,
    "participant2_id" UUID NOT NULL,
    "last_message_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID,
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "file_url" TEXT,
    "file_name" TEXT,
    "file_size" INTEGER,
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_orgs_org_type" ON "orgs"("org_type");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_org_id" ON "users"("org_id");

-- CreateIndex
CREATE INDEX "idx_users_user_type" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "idx_users_approval_status" ON "users"("approval_status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "startup_profiles_user_id_key" ON "startup_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_startup_profiles_org_id" ON "startup_profiles"("org_id");

-- CreateIndex
CREATE INDEX "idx_startup_profiles_user_id" ON "startup_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "investor_profiles_user_id_key" ON "investor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_investor_profiles_org_id" ON "investor_profiles"("org_id");

-- CreateIndex
CREATE INDEX "idx_investor_profiles_user_id" ON "investor_profiles"("user_id");

-- CreateIndex
CREATE INDEX "idx_projects_org_id" ON "projects"("org_id");

-- CreateIndex
CREATE INDEX "idx_projects_startup_id" ON "projects"("startup_id");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_iec_level" ON "projects"("iec_level");

-- CreateIndex
CREATE INDEX "idx_project_documents_org_id" ON "project_documents"("org_id");

-- CreateIndex
CREATE INDEX "idx_project_documents_project_id" ON "project_documents"("project_id");

-- CreateIndex
CREATE INDEX "idx_data_rooms_org_id" ON "data_rooms"("org_id");

-- CreateIndex
CREATE INDEX "idx_data_rooms_project_id" ON "data_rooms"("project_id");

-- CreateIndex
CREATE INDEX "idx_data_room_documents_org_id" ON "data_room_documents"("org_id");

-- CreateIndex
CREATE INDEX "idx_data_room_documents_data_room_id" ON "data_room_documents"("data_room_id");

-- CreateIndex
CREATE INDEX "idx_data_room_requests_org_id" ON "data_room_requests"("org_id");

-- CreateIndex
CREATE INDEX "idx_data_room_requests_data_room_id" ON "data_room_requests"("data_room_id");

-- CreateIndex
CREATE INDEX "idx_data_room_requests_requester_id" ON "data_room_requests"("requester_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_invites_token_key" ON "org_invites"("token");

-- CreateIndex
CREATE INDEX "idx_org_invites_org_id" ON "org_invites"("org_id");

-- CreateIndex
CREATE INDEX "idx_org_invites_invitee_email" ON "org_invites"("invitee_email");

-- CreateIndex
CREATE INDEX "idx_org_invites_token" ON "org_invites"("token");

-- CreateIndex
CREATE INDEX "idx_iec_levels_org_id" ON "iec_levels"("org_id");

-- CreateIndex
CREATE INDEX "idx_iec_criteria_level_id" ON "iec_criteria"("iec_level_id");

-- CreateIndex
CREATE INDEX "idx_project_iec_assessments_project_id" ON "project_iec_assessments"("project_id");

-- CreateIndex
CREATE INDEX "idx_project_iec_assessments_org_id" ON "project_iec_assessments"("org_id");

-- CreateIndex
CREATE INDEX "idx_project_iec_scores_assessment_id" ON "project_iec_scores"("assessment_id");

-- CreateIndex
CREATE INDEX "idx_match_intents_org_id" ON "match_intents"("org_id");

-- CreateIndex
CREATE INDEX "idx_match_intents_investor_id" ON "match_intents"("investor_id");

-- CreateIndex
CREATE INDEX "idx_match_intents_project_id" ON "match_intents"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_intents_investor_id_project_id_key" ON "match_intents"("investor_id", "project_id");

-- CreateIndex
CREATE INDEX "idx_matches_org_id" ON "matches"("org_id");

-- CreateIndex
CREATE INDEX "idx_matches_startup_id" ON "matches"("startup_id");

-- CreateIndex
CREATE INDEX "idx_matches_investor_id" ON "matches"("investor_id");

-- CreateIndex
CREATE INDEX "idx_match_events_match_id" ON "match_events"("match_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_org_id" ON "audit_logs"("org_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_actor_id" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_notifications_org_id" ON "notifications"("org_id");

-- CreateIndex
CREATE INDEX "idx_notifications_recipient" ON "notifications"("recipient_user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_type" ON "notifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_match_id_key" ON "conversations"("match_id");

-- CreateIndex
CREATE INDEX "idx_conversations_org_id" ON "conversations"("org_id");

-- CreateIndex
CREATE INDEX "idx_conversations_participant1" ON "conversations"("participant1_id");

-- CreateIndex
CREATE INDEX "idx_conversations_participant2" ON "conversations"("participant2_id");

-- CreateIndex
CREATE INDEX "idx_messages_org_id" ON "messages"("org_id");

-- CreateIndex
CREATE INDEX "idx_messages_conversation_id" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "idx_messages_sender_id" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_messages_created_at" ON "messages"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_profiles" ADD CONSTRAINT "startup_profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup_profiles" ADD CONSTRAINT "startup_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investor_profiles" ADD CONSTRAINT "investor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startup_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_rooms" ADD CONSTRAINT "data_rooms_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_rooms" ADD CONSTRAINT "data_rooms_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_room_documents" ADD CONSTRAINT "data_room_documents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_room_documents" ADD CONSTRAINT "data_room_documents_data_room_id_fkey" FOREIGN KEY ("data_room_id") REFERENCES "data_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_room_requests" ADD CONSTRAINT "data_room_requests_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_room_requests" ADD CONSTRAINT "data_room_requests_data_room_id_fkey" FOREIGN KEY ("data_room_id") REFERENCES "data_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_room_requests" ADD CONSTRAINT "data_room_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_invites" ADD CONSTRAINT "org_invites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_invites" ADD CONSTRAINT "org_invites_inviter_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iec_levels" ADD CONSTRAINT "iec_levels_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iec_criteria" ADD CONSTRAINT "iec_criteria_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iec_criteria" ADD CONSTRAINT "iec_criteria_iec_level_id_fkey" FOREIGN KEY ("iec_level_id") REFERENCES "iec_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_assessments" ADD CONSTRAINT "project_iec_assessments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_assessments" ADD CONSTRAINT "project_iec_assessments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_assessments" ADD CONSTRAINT "project_iec_assessments_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_assessments" ADD CONSTRAINT "project_iec_assessments_target_level_id_fkey" FOREIGN KEY ("target_level_id") REFERENCES "iec_levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_assessments" ADD CONSTRAINT "project_iec_assessments_final_level_id_fkey" FOREIGN KEY ("final_level_id") REFERENCES "iec_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_scores" ADD CONSTRAINT "project_iec_scores_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_scores" ADD CONSTRAINT "project_iec_scores_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "project_iec_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_iec_scores" ADD CONSTRAINT "project_iec_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "iec_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_intents" ADD CONSTRAINT "match_intents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_intents" ADD CONSTRAINT "match_intents_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "investor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_intents" ADD CONSTRAINT "match_intents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_startup_id_fkey" FOREIGN KEY ("startup_id") REFERENCES "startup_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_investor_id_fkey" FOREIGN KEY ("investor_id") REFERENCES "investor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_match_intent_id_fkey" FOREIGN KEY ("match_intent_id") REFERENCES "match_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_last_message_id_fkey" FOREIGN KEY ("last_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
