import type { BaseEntity, UUID } from "./user";

export enum ProjectStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

export enum ProjectDocumentType {
  PITCH_DECK = "pitch_deck",
  FINANCIALS = "financials",
  ONE_PAGER = "one_pager",
  PRODUCT_DEMO = "product_demo",
  OTHER = "other"
}

export interface Project extends BaseEntity {
  startup_id: UUID;
  title: string;
  slug?: string | null;
  summary?: string | null;
  description?: string | null;
  hero_image_url?: string | null;
  logo_url?: string | null;
  industry?: string | null;
  stage?: string | null;
  funding_need_amount?: number | null;
  funding_currency?: string | null;
  status: ProjectStatus;
  iec_level?: string | null;
  view_count?: number | null;
  interest_count?: number | null;
  brand_palette?: string | null;
  growth_rate_pct?: number | null;
}

export interface ProjectCreateDto {
  title: string;
  summary?: string;
  description?: string;
  hero_image_url?: string;
  industry?: string;
  stage?: string;
  funding_need_amount?: number;
  funding_currency?: string;
}

export interface ProjectUpdateDto extends Partial<ProjectCreateDto> {}

export interface ProjectDocument extends BaseEntity {
  project_id: UUID;
  type: ProjectDocumentType;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size?: number | null;
  is_public: boolean;
}

