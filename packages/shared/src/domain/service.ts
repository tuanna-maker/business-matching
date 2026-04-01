import type { BaseEntity } from "./user";

export type ServiceListingStatus = "draft" | "published" | "archived";

export interface ServiceListing extends BaseEntity {
  startup_id: string;
  title: string;
  slug: string;
  summary?: string | null;
  description?: string | null;
  category?: string | null;
  industry?: string | null;
  price_from?: number | null;
  price_to?: number | null;
  currency?: string | null;
  status: ServiceListingStatus;
}

