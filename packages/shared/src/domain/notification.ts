import type { BaseEntity, UUID } from "./user";

export interface Notification extends BaseEntity {
  recipient_user_id: UUID;
  type: string;
  payload?: unknown | null;
  read_at?: string | null;
}

