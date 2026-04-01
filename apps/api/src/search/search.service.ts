import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface SearchResultItem {
  type: "project" | "organization" | "service" | "investor" | "startup";
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  relevance_score: number;
  metadata: Record<string, any>;
}

export interface SearchResults {
  query: string;
  total: number;
  results: SearchResultItem[];
  groups: {
    projects: SearchResultItem[];
    organizations: SearchResultItem[];
    services: SearchResultItem[];
    investors: SearchResultItem[];
    startups: SearchResultItem[];
  };
}

export interface SearchFilters {
  types?: Array<"project" | "organization" | "service" | "investor" | "startup">;
  industry?: string;
  stage?: string;
  fundingMin?: number;
  fundingMax?: number;
  iecLevel?: string;
  verified?: boolean;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Global unified search across all entity types
   */
  async search(
    query: string,
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResults> {
    const normalizedQuery = query.toLowerCase().trim();
    const limitPerType = Math.ceil(limit / 5);

    // Determine which types to search
    const searchTypes = filters.types?.length
      ? filters.types
      : ["project", "organization", "service", "investor", "startup"];

    // Search all types in parallel
    const [projects, organizations, services, investors, startups] =
      await Promise.all([
        searchTypes.includes("project")
          ? this.searchProjects(normalizedQuery, filters, limitPerType)
          : [],
        searchTypes.includes("organization")
          ? this.searchOrganizations(normalizedQuery, filters, limitPerType)
          : [],
        searchTypes.includes("service")
          ? this.searchServices(normalizedQuery, filters, limitPerType)
          : [],
        searchTypes.includes("investor")
          ? this.searchInvestors(normalizedQuery, filters, limitPerType)
          : [],
        searchTypes.includes("startup")
          ? this.searchStartups(normalizedQuery, filters, limitPerType)
          : []
      ]);

    // Combine and sort by relevance
    const allResults = [...projects, ...organizations, ...services, ...investors, ...startups]
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);

    return {
      query,
      total: allResults.length,
      results: allResults,
      groups: {
        projects,
        organizations,
        services,
        investors,
        startups
      }
    };
  }

  /**
   * Search projects
   */
  private async searchProjects(
    query: string,
    filters: SearchFilters,
    limit: number
  ): Promise<SearchResultItem[]> {
    const where: any = {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { industry: { contains: query, mode: "insensitive" } },
        { stage: { contains: query, mode: "insensitive" } }
      ]
    };

    if (filters.industry) {
      where.industry = filters.industry;
    }
    if (filters.stage) {
      where.stage = filters.stage;
    }
    if (filters.fundingMin !== undefined) {
      where.funding_need_amount = { gte: filters.fundingMin };
    }
    if (filters.fundingMax !== undefined) {
      where.funding_need_amount = { ...where.funding_need_amount, lte: filters.fundingMax };
    }
    if (filters.iecLevel) {
      where.iec_level = filters.iecLevel;
    }

    const projects = await this.prisma.project.findMany({
      where,
      take: limit,
      include: {
        startup_profile: {
          select: { company_name: true }
        }
      },
      orderBy: [{ created_at: "desc" }]
    });

    return projects.map((p) => ({
      type: "project" as const,
      id: p.id,
      title: p.title,
      subtitle: `${p.industry ?? "Unknown"} · ${p.stage ?? "Unknown Stage"}`,
      description: p.description?.slice(0, 200) ?? null,
      image_url: p.logo_url,
      relevance_score: this.calculateRelevance(query, [p.title, p.description, p.industry]),
      metadata: {
        industry: p.industry,
        stage: p.stage,
        iec_level: p.iec_level,
        funding_need_amount: p.funding_need_amount ? Number(p.funding_need_amount) : null,
        startup_name: p.startup_profile?.company_name
      }
    }));
  }

  /**
   * Search organizations
   */
  private async searchOrganizations(
    query: string,
    filters: SearchFilters,
    limit: number
  ): Promise<SearchResultItem[]> {
    const where: any = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { business_sector: { contains: query, mode: "insensitive" } }
      ]
    };

    if (filters.verified !== undefined) {
      where.verification_status = filters.verified ? "approved" : { not: "approved" };
    }

    const orgs = await this.prisma.org.findMany({
      where,
      take: limit,
      include: {
        TrustScore: true
      },
      orderBy: [{ created_at: "desc" }]
    });

    return orgs.map((o) => ({
      type: "organization" as const,
      id: o.id,
      title: o.name,
      subtitle: o.business_sector ?? o.org_type ?? "Organization",
      description: o.description?.slice(0, 200) ?? null,
      image_url: o.logo_url,
      relevance_score: this.calculateRelevance(query, [o.name, o.description, o.business_sector]),
      metadata: {
        org_type: o.org_type,
        business_sector: o.business_sector,
        verification_status: o.verification_status,
        trust_score: (o.TrustScore as any)?.score ?? null
      }
    }));
  }

  /**
   * Search service listings (dynamic access - model may not exist)
   */
  private async searchServices(
    query: string,
    _filters: SearchFilters,
    limit: number
  ): Promise<SearchResultItem[]> {
    try {
      // ServiceListing model may not exist in schema yet - use dynamic access
      const serviceListingModel = (this.prisma as any).serviceListing;
      if (!serviceListingModel) {
        return [];
      }

      const services = await serviceListingModel.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { contains: query, mode: "insensitive" } }
          ]
        },
        take: limit,
        include: {
          startup: { select: { company_name: true } }
        },
        orderBy: [{ created_at: "desc" }]
      });

      return services.map((s: any) => ({
        type: "service" as const,
        id: s.id,
        title: s.title,
        subtitle: `${s.category ?? "Service"} · ${s.price_from ? `From ${s.price_from}` : "Contact for pricing"}`,
        description: s.description?.slice(0, 200) ?? null,
        image_url: null,
        relevance_score: this.calculateRelevance(query, [s.title, s.description, s.category]),
        metadata: {
          category: s.category,
          price_from: s.price_from ? Number(s.price_from) : null,
          price_to: s.price_to ? Number(s.price_to) : null,
          provider_name: s.startup?.company_name
        }
      }));
    } catch (e: any) {
      // If DB migration wasn't applied yet, return empty
      const msg = String(e?.message ?? "");
      if (msg.includes("service_listings") && msg.includes("does not exist")) {
        return [];
      }
      throw e;
    }
  }

  /**
   * Search investor profiles
   */
  private async searchInvestors(
    query: string,
    filters: SearchFilters,
    limit: number
  ): Promise<SearchResultItem[]> {
    const where: any = {
      OR: [
        { company_name: { contains: query, mode: "insensitive" } },
        { investment_focus: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } }
      ]
    };

    if (filters.industry) {
      where.investment_focus = { contains: filters.industry, mode: "insensitive" };
    }

    const investors = await this.prisma.investorProfile.findMany({
      where,
      take: limit,
      include: {
        user: { select: { full_name: true, avatar_url: true } },
        org: { select: { name: true, logo_url: true, verification_status: true } }
      },
      orderBy: [{ created_at: "desc" }]
    });

    return investors.map((i) => ({
      type: "investor" as const,
      id: i.id,
      title: i.company_name ?? i.user?.full_name ?? "Investor",
      subtitle: i.investment_focus ?? "Investor",
      description: `Investment: $${i.investment_amount_min?.toString() ?? "-"} - $${i.investment_amount_max?.toString() ?? "-"}`,
      image_url: i.org?.logo_url ?? i.user?.avatar_url ?? null,
      relevance_score: this.calculateRelevance(query, [
        i.company_name,
        i.investment_focus,
        i.location
      ]),
      metadata: {
        company_name: i.company_name,
        investment_focus: i.investment_focus,
        investment_stage: i.investment_stage,
        investment_amount_min: i.investment_amount_min ? Number(i.investment_amount_min) : null,
        investment_amount_max: i.investment_amount_max ? Number(i.investment_amount_max) : null,
        org_verified: i.org?.verification_status === "approved"
      }
    }));
  }

  /**
   * Search startup profiles
   */
  private async searchStartups(
    query: string,
    filters: SearchFilters,
    limit: number
  ): Promise<SearchResultItem[]> {
    const where: any = {
      OR: [
        { company_name: { contains: query, mode: "insensitive" } },
        { industry: { contains: query, mode: "insensitive" } },
        { company_description: { contains: query, mode: "insensitive" } }
      ]
    };

    if (filters.industry) {
      where.industry = filters.industry;
    }
    if (filters.stage) {
      where.funding_stage = filters.stage;
    }

    const startups = await this.prisma.startupProfile.findMany({
      where,
      take: limit,
      include: {
        user: { select: { full_name: true, avatar_url: true } },
        org: { select: { name: true, logo_url: true, verification_status: true } }
      },
      orderBy: [{ created_at: "desc" }]
    });

    return startups.map((s) => ({
      type: "startup" as const,
      id: s.id,
      title: s.company_name,
      subtitle: `${s.industry ?? "Unknown"} · ${s.funding_stage ?? "Unknown Stage"}`,
      description: s.company_description?.slice(0, 200) ?? null,
      image_url: s.avatar_url ?? s.org?.logo_url ?? null,
      relevance_score: this.calculateRelevance(query, [s.company_name, s.industry, s.company_description]),
      metadata: {
        industry: s.industry,
        funding_stage: s.funding_stage,
        founded_year: s.founded_year,
        team_size: s.team_size,
        org_verified: s.org?.verification_status === "approved"
      }
    }));
  }

  /**
   * Calculate relevance score based on query match
   */
  private calculateRelevance(query: string, fields: (string | null | undefined)[]): number {
    let score = 0;
    const normalizedQuery = query.toLowerCase();

    for (const field of fields) {
      if (!field) continue;
      const normalizedField = field.toLowerCase();

      // Exact match in field
      if (normalizedField === normalizedQuery) {
        score += 100;
      }
      // Field starts with query
      else if (normalizedField.startsWith(normalizedQuery)) {
        score += 80;
      }
      // Query is a complete word in field
      else if (normalizedField.includes(` ${normalizedQuery} `) || 
               normalizedField.startsWith(`${normalizedQuery} `) ||
               normalizedField.endsWith(` ${normalizedQuery}`)) {
        score += 60;
      }
      // Query found anywhere in field
      else if (normalizedField.includes(normalizedQuery)) {
        score += 40;
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSuggestions(query: string, limit: number = 10): Promise<string[]> {
    const normalizedQuery = query.toLowerCase().trim();

    if (normalizedQuery.length < 2) {
      return [];
    }

    // Search for unique names across entity types
    const [projects, orgs, startups] = await Promise.all([
      this.prisma.project.findMany({
        where: { title: { contains: normalizedQuery, mode: "insensitive" } },
        select: { title: true },
        take: limit
      }),
      this.prisma.org.findMany({
        where: { name: { contains: normalizedQuery, mode: "insensitive" } },
        select: { name: true },
        take: limit
      }),
      this.prisma.startupProfile.findMany({
        where: { company_name: { contains: normalizedQuery, mode: "insensitive" } },
        select: { company_name: true },
        take: limit
      })
    ]);

    const suggestions = new Set<string>();
    
    projects.forEach((p) => suggestions.add(p.title));
    orgs.forEach((o) => suggestions.add(o.name));
    startups.forEach((s) => suggestions.add(s.company_name));

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get popular/trending searches
   */
  async getTrending(): Promise<string[]> {
    // Return popular industries as trending topics
    const industries = await this.prisma.project.groupBy({
      by: ["industry"],
      _count: { industry: true },
      orderBy: { _count: { industry: "desc" } },
      take: 10,
      where: { industry: { not: null } }
    });

    return industries
      .filter((i) => i.industry)
      .map((i) => i.industry as string);
  }
}
