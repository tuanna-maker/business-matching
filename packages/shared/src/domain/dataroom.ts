import type { BaseEntity, UUID } from "./user";

export enum DataRoomRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected"
}

/**
 * 3-Tier Data Access Model (SRS Epic 3)
 * - PUBLIC: Visible to all verified users
 * - PROTECTED: Requires approval, default 30-day TTL
 * - CONFIDENTIAL: Requires NDA + Trust Score >= 60, default 14-day TTL
 */
export enum DataAccessTier {
  PUBLIC = "public",
  PROTECTED = "protected",
  CONFIDENTIAL = "confidential"
}

export interface DataRoom extends BaseEntity {
  project_id: UUID;
  name: string;
  description?: string | null;
}

export interface DataRoomDocument extends BaseEntity {
  data_room_id: UUID;
  title: string;
  type: string;
  storage_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  tier: DataAccessTier;
}

export interface DataRoomRequest extends BaseEntity {
  project_id: UUID;
  investor_id: UUID;
  data_room_id?: UUID | null;
  status: DataRoomRequestStatus;
  reason?: string | null;
  requested_tier?: DataAccessTier | null;
  purpose?: string | null;
}

/**
 * Tracks approved access with TTL
 */
export interface DataAccessGrant {
  id: UUID;
  data_room_id: UUID;
  user_id: UUID;
  tier: DataAccessTier;
  granted_at: string;
  expires_at: string;
  revoked_at?: string | null;
  nda_signed?: boolean;
}

export interface DataRoomWithDocuments extends DataRoom {
  documents: DataRoomDocument[];
  my_access_tier?: DataAccessTier | null;
  my_grant_expires_at?: string | null;
}

