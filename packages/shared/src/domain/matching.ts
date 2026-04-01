import type { BaseEntity, UUID } from "./user";

export enum MatchIntentStatus {
  LIKED = "liked",
  REQUESTED_MEETING = "requested_meeting",
  NOT_INTERESTED = "not_interested",
  MATCHED = "matched"
}

/**
 * Match Pipeline Stages (SRS Epic 4.3)
 * Represents the lifecycle of a deal from initial match to closure
 */
export enum MatchStatus {
  PENDING_INTRO = "pending_intro",       // Initial match created, awaiting introduction
  INTRO_DONE = "intro_done",             // Introduction made, awaiting response
  IN_DISCUSSION = "in_discussion",       // Active discussions
  MEETING_SCHEDULED = "meeting_scheduled", // Meeting/call scheduled
  DUE_DILIGENCE = "due_diligence",       // Formal review stage
  NEGOTIATION = "negotiation",           // Term negotiation
  CLOSED_DEAL = "closed_deal",           // Won - deal completed
  CLOSED_LOST = "closed_lost",           // Lost - deal fell through
  REJECTED = "rejected"                  // Explicitly rejected by either party
}

/**
 * Valid pipeline stage transitions
 */
export const VALID_STAGE_TRANSITIONS: Record<MatchStatus, MatchStatus[]> = {
  [MatchStatus.PENDING_INTRO]: [MatchStatus.INTRO_DONE, MatchStatus.REJECTED],
  [MatchStatus.INTRO_DONE]: [MatchStatus.IN_DISCUSSION, MatchStatus.REJECTED, MatchStatus.CLOSED_LOST],
  [MatchStatus.IN_DISCUSSION]: [MatchStatus.MEETING_SCHEDULED, MatchStatus.REJECTED, MatchStatus.CLOSED_LOST],
  [MatchStatus.MEETING_SCHEDULED]: [MatchStatus.DUE_DILIGENCE, MatchStatus.IN_DISCUSSION, MatchStatus.REJECTED, MatchStatus.CLOSED_LOST],
  [MatchStatus.DUE_DILIGENCE]: [MatchStatus.NEGOTIATION, MatchStatus.REJECTED, MatchStatus.CLOSED_LOST],
  [MatchStatus.NEGOTIATION]: [MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST, MatchStatus.REJECTED],
  [MatchStatus.CLOSED_DEAL]: [], // Terminal state
  [MatchStatus.CLOSED_LOST]: [], // Terminal state
  [MatchStatus.REJECTED]: []     // Terminal state
};

export enum MatchEventType {
  INTRO_SENT = "intro_sent",
  MEETING_SCHEDULED = "meeting_scheduled",
  MEETING_DONE = "meeting_done",
  NOTE_ADDED = "note_added",
  STATUS_CHANGED = "status_changed",
  DOCUMENT_SHARED = "document_shared",
  DD_STARTED = "dd_started",
  TERM_SHEET_SENT = "term_sheet_sent"
}

export interface MatchIntent extends BaseEntity {
  investor_id: UUID;
  project_id: UUID;
  status: MatchIntentStatus;
  source?: string | null;
}

export interface Match extends BaseEntity {
  project_id: UUID;
  startup_id: UUID;
  investor_id: UUID;
  match_intent_id?: UUID | null;
  iec_level_at_match?: string | null;
  status: MatchStatus;
}

export interface MatchEvent extends BaseEntity {
  match_id: UUID;
  event_type: MatchEventType;
  old_status?: MatchStatus | null;
  new_status?: MatchStatus | null;
  actor_id: UUID;
  note?: string | null;
}

/**
 * Pipeline statistics for dashboard/analytics
 */
export interface PipelineStats {
  total_matches: number;
  by_stage: Record<MatchStatus, number>;
  conversion_rates: {
    intro_to_discussion: number;
    discussion_to_meeting: number;
    meeting_to_dd: number;
    dd_to_negotiation: number;
    negotiation_to_closed: number;
    overall_win_rate: number;
  };
  avg_days_in_stage: Record<MatchStatus, number>;
}

export interface MatchWithDetails extends Match {
  project?: {
    id: string;
    title: string;
    industry?: string | null;
    stage?: string | null;
  };
  startup?: {
    id: string;
    company_name: string;
    user?: { full_name: string; email: string };
  };
  investor?: {
    id: string;
    company_name: string;
    user?: { full_name: string; email: string };
  };
  events?: MatchEvent[];
  days_in_current_stage?: number;
}

