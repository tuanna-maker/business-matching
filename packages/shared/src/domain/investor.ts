import type { BaseEntity, UUID } from "./user";

export enum InvestorType {
  ANGEL = "angel",
  VC = "vc",
  CVC = "cvc",
  PE = "pe",
  ACCELERATOR = "accelerator"
}

export interface InvestorProfile extends BaseEntity {
  user_id: UUID;
  organization_name: string;
  investor_type?: InvestorType | null;
  ticket_size_min?: number | null;
  ticket_size_max?: number | null;
  preferred_industries?: string[] | null;
  preferred_stages?: string[] | null;
  country?: string | null;
}

