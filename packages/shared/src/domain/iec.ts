import type { BaseEntity, UUID } from "./user";

export enum IecLevel {
  L0 = "L0",
  L1 = "L1",
  L3 = "L3"
}

export enum AssessmentStatus {
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface IecLevelDefinition extends BaseEntity {
  code: IecLevel;
  name: string;
  description?: string | null;
  order: number;
}

export interface IecCriterion extends BaseEntity {
  iec_level_id: number;
  code: string;
  title: string;
  description?: string | null;
  weight?: number | null;
  is_required: boolean;
}

export interface ProjectIecAssessment extends BaseEntity {
  project_id: UUID;
  assessor_id: UUID;
  target_level_id: number;
  final_level_id?: number | null;
  status: AssessmentStatus;
  comments?: string | null;
}

export interface ProjectIecScore extends BaseEntity {
  assessment_id: UUID;
  criterion_id: number;
  score: number;
  comment?: string | null;
}

