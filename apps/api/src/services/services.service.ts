import { ForbiddenException, Injectable } from "@nestjs/common";
import type { ServiceListing, ServiceListingStatus } from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  private map(db: any): ServiceListing {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      startup_id: db.startup_id,
      title: db.title,
      slug: db.slug,
      summary: db.summary ?? null,
      description: db.description ?? null,
      category: db.category ?? null,
      industry: db.industry ?? null,
      price_from: db.price_from ? Number(db.price_from) : null,
      price_to: db.price_to ? Number(db.price_to) : null,
      currency: db.currency ?? null,
      status: db.status as ServiceListingStatus
    };
  }

  async listPublished(query: { search?: string; industry?: string; category?: string }) {
    const q = (query.search ?? "").trim();
    const industry = (query.industry ?? "").trim();
    const category = (query.category ?? "").trim();

    let rows: any[] = [];
    try {
      // serviceListing model may not exist in schema yet - use dynamic access
      const serviceListingModel = (this.prisma as any).serviceListing;
      if (!serviceListingModel) {
        return [];
      }
      rows = await serviceListingModel.findMany({
        where: {
          status: "published",
          ...(industry ? { industry: { equals: industry, mode: "insensitive" } } : {}),
          ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
          ...(q
            ? {
                OR: [
                  { title: { contains: q, mode: "insensitive" } },
                  { summary: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } }
                ]
              }
            : {})
        },
        include: {
          startup: { include: { user: true } }
        },
        orderBy: { updated_at: "desc" },
        take: 200
      });
    } catch (e: any) {
      // If DB migration wasn't applied yet, don't take down the whole app.
      const msg = String(e?.message ?? "");
      if (msg.includes("service_listings") && msg.includes("does not exist")) {
        return [];
      }
      throw e;
    }

    return rows.map((r) => ({
      listing: this.map(r),
      startup: {
        id: r.startup.id,
        company_name: r.startup.company_name,
        industry: r.startup.industry ?? null,
        website: r.startup.website ?? null,
        user: {
          full_name: r.startup.user.full_name,
          email: r.startup.user.email,
          avatar_url: r.startup.user.avatar_url ?? null
        }
      }
    }));
  }

  async createForStartup(
    currentUserId: string,
    dto: Pick<
      ServiceListing,
      "title" | "slug" | "summary" | "description" | "category" | "industry" | "price_from" | "price_to" | "currency"
    >
  ): Promise<ServiceListing> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) throw new ForbiddenException("Current user is not a startup owner");

    // serviceListing model may not exist in schema yet - use dynamic access
    const serviceListingModel = (this.prisma as any).serviceListing;
    if (!serviceListingModel) {
      throw new ForbiddenException("Service listing feature is not available");
    }
    const created = await serviceListingModel.create({
      data: {
        id: randomUUID(),
        org_id: startup.org_id,
        startup_id: startup.id,
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary ?? null,
        description: dto.description ?? null,
        category: dto.category ?? null,
        industry: dto.industry ?? null,
        price_from: dto.price_from ?? null,
        price_to: dto.price_to ?? null,
        currency: dto.currency ?? null,
        status: "published",
        created_by: currentUserId
      }
    });
    return this.map(created);
  }
}

