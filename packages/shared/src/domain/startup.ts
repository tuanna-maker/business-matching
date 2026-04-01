import type { BaseEntity, UUID } from "./user";

export enum StartupStage {
  IDEA = "idea",
  MVP = "mvp",
  SEED = "seed",
  SERIES_A = "series_a"
}

export interface StartupProfile extends BaseEntity {
  user_id: UUID;
  company_name: string;
  website?: string | null;
  industry?: string | null;
  country?: string | null;
  city?: string | null;
  stage?: StartupStage | null;
  funding_need_amount?: number | null;
  funding_currency?: string | null;
  short_description?: string | null;
}

