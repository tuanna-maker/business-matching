import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("directory")
@UseGuards(JwtAuthGuard)
export class DirectoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("investors")
  async listInvestors(
    @Query("search") search?: string,
    @Query("industry") industry?: string,
    @Req() req?: any
  ) {
    const q = (search ?? "").trim();
    const ind = (industry ?? "").trim();

    const investors = await this.prisma.investorProfile.findMany({
      where: {
        ...(ind
          ? {
              investment_focus: { contains: ind, mode: "insensitive" }
            }
          : {}),
        ...(q
          ? {
              OR: [
                { company_name: { contains: q, mode: "insensitive" } },
                { user: { full_name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {}),
        user: {
          approval_status: "approved"
        }
      },
      include: { user: true },
      orderBy: { created_at: "desc" },
      take: 200
    });

    return investors.map((p) => ({
      id: p.id,
      org_id: p.org_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
      created_by: p.created_by,
      user_id: p.user_id,
      organization_name: p.company_name,
      investor_type: p.investment_focus ?? null,
      ticket_size_min: p.investment_amount_min ? Number(p.investment_amount_min) : null,
      ticket_size_max: p.investment_amount_max ? Number(p.investment_amount_max) : null,
      preferred_industries: p.investment_focus ?? null,
      preferred_stages: p.investment_stage ?? null,
      country: p.location ?? null,
      user: {
        id: p.user.id,
        full_name: p.user.full_name,
        email: p.user.email,
        avatar_url: p.user.avatar_url ?? null
      }
    }));
  }

  @Get("startups")
  async listStartups(@Query("search") search?: string, @Query("industry") industry?: string) {
    const q = (search ?? "").trim();
    const ind = (industry ?? "").trim();

    const startups = await this.prisma.startupProfile.findMany({
      where: {
        ...(ind
          ? {
              industry: { equals: ind, mode: "insensitive" }
            }
          : {}),
        ...(q
          ? {
              OR: [
                { company_name: { contains: q, mode: "insensitive" } },
                { company_description: { contains: q, mode: "insensitive" } },
                { user: { full_name: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {}),
        user: {
          approval_status: "approved"
        }
      },
      include: {
        user: true,
        project: {
          where: { status: "published" },
          orderBy: { updated_at: "desc" },
          take: 1
        }
      },
      orderBy: { created_at: "desc" },
      take: 200
    });

    return startups.map((p) => ({
      id: p.id,
      org_id: p.org_id,
      created_at: p.created_at,
      updated_at: p.updated_at,
      created_by: p.created_by,
      user_id: p.user_id,
      company_name: p.company_name,
      website: p.website ?? null,
      industry: p.industry ?? null,
      country: p.location ?? null,
      city: null,
      stage: p.funding_stage ?? null,
      short_description: p.company_description ?? null,
      user: {
        id: p.user.id,
        full_name: p.user.full_name,
        email: p.user.email,
        avatar_url: p.user.avatar_url ?? null
      },
      latest_project: p.project[0]
        ? {
            id: p.project[0].id,
            title: p.project[0].title,
            slug: p.project[0].id,
            summary: p.project[0].summary ?? null,
            iec_level: p.project[0].iec_level ?? null,
            industry: p.project[0].industry ?? null,
            stage: p.project[0].stage ?? null
          }
        : null
    }));
  }
}

