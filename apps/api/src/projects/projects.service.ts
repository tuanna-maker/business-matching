import { ForbiddenException, Injectable } from "@nestjs/common";
import type {
  Project,
  ProjectCreateDto,
  ProjectUpdateDto
} from "@iec-hub/shared";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";

/** Columns present before optional branding/growth migration — used if DB is behind schema. */
const PROJECT_CORE_SELECT = {
  id: true,
  org_id: true,
  startup_id: true,
  title: true,
  summary: true,
  description: true,
  industry: true,
  stage: true,
  funding_need_amount: true,
  funding_currency: true,
  status: true,
  iec_level: true,
  hero_image_url: true,
  logo_url: true,
  view_count: true,
  interest_count: true,
  last_activity_at: true,
  created_at: true,
  updated_at: true,
  created_by: true
} as const;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private isMissingOptionalProjectColumnError(e: unknown): boolean {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2022"
    ) {
      return true;
    }
    const msg = e instanceof Error ? e.message : "";
    return (
      typeof msg === "string" &&
      /column\s+[`"]?[\w.]+[`"]?\s+does not exist/i.test(msg)
    );
  }

  private shouldDowngradeIecLevel(existing: any, dto: ProjectUpdateDto): boolean {
    const currentLevel = (existing.iec_level ?? null) as string | null;
    if (currentLevel !== "L1" && currentLevel !== "L3") return false;

    const changed = (key: keyof ProjectUpdateDto) =>
      dto[key] !== undefined && dto[key] !== (existing as any)[key];

    // Core fields that trigger downgrade (BRD rule)
    return (
      changed("title") ||
      changed("summary") ||
      changed("description") ||
      changed("hero_image_url") ||
      changed("industry") ||
      changed("stage") ||
      changed("funding_need_amount") ||
      changed("funding_currency")
    );
  }

  private toIso(d: unknown): string {
    if (d instanceof Date) return d.toISOString();
    if (typeof d === "string" || typeof d === "number") {
      return new Date(d).toISOString();
    }
    return new Date().toISOString();
  }

  private parseGrowthRatePct(v: unknown): number | null {
    if (v == null) return null;
    if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n) : null;
  }

  private mapDbProject(db: any): Project & { last_activity_at: string | null } {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: this.toIso(db.created_at),
      updated_at: this.toIso(db.updated_at),
      created_by: db.created_by ?? null,
      startup_id: db.startup_id,
      title: db.title,
      slug: (db as { slug?: string }).slug ?? "",
      summary: db.summary ?? null,
      description: db.description ?? null,
      hero_image_url: db.hero_image_url ?? null,
      logo_url: db.logo_url ?? null,
      industry: db.industry ?? null,
      stage: db.stage ?? null,
      funding_need_amount: db.funding_need_amount
        ? Number(db.funding_need_amount)
        : null,
      funding_currency: db.funding_currency ?? null,
      status: db.status,
      iec_level: db.iec_level ?? null,
      view_count: typeof db.view_count === "number" ? db.view_count : null,
      interest_count: typeof db.interest_count === "number" ? db.interest_count : null,
      brand_palette: db.brand_palette ?? null,
      growth_rate_pct: this.parseGrowthRatePct(db.growth_rate_pct),
      // p1-9: expose last_activity_at để FE hiển thị freshness signal
      last_activity_at: db.last_activity_at ? this.toIso(db.last_activity_at) : null
    };
  }

  private async findManyProjectsCore(
    where: Prisma.ProjectWhereInput,
    orderBy: Prisma.ProjectOrderByWithRelationInput
  ): Promise<any[]> {
    try {
      return await this.prisma.project.findMany({ where, orderBy });
    } catch (e) {
      if (!this.isMissingOptionalProjectColumnError(e)) throw e;
      return this.prisma.project.findMany({
        where,
        orderBy,
        select: PROJECT_CORE_SELECT
      });
    }
  }

  private async findUniqueProjectCore(
    where: Prisma.ProjectWhereUniqueInput
  ): Promise<any | null> {
    try {
      return await this.prisma.project.findUnique({ where });
    } catch (e) {
      if (!this.isMissingOptionalProjectColumnError(e)) throw e;
      return this.prisma.project.findUnique({
        where,
        select: PROJECT_CORE_SELECT
      });
    }
  }

  async create(dto: ProjectCreateDto, currentUserId: string): Promise<Project> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) {
      throw new ForbiddenException("Current user is not a startup owner");
    }

    const slugBase = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const created = await this.prisma.project.create({
      data: {
        id: randomUUID(),
        org_id: startup.org_id,
        startup_id: startup.id,
        title: dto.title,
        summary: dto.summary,
        description: dto.description,
        hero_image_url: dto.hero_image_url,
        industry: dto.industry,
        stage: dto.stage,
        funding_need_amount: dto.funding_need_amount
          ? dto.funding_need_amount
          : undefined,
        funding_currency: dto.funding_currency
      }
    });

    return this.mapDbProject(created);
  }

  async findAllForStartup(userId: string): Promise<Project[]> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: userId }
    });
    if (!startup) {
      return [];
    }
    const items = await this.findManyProjectsCore(
      { startup_id: startup.id },
      { created_at: "desc" }
    );
    return items.map((p) => this.mapDbProject(p));
  }

  async findAllPublished(orgId: string | null): Promise<Project[]> {
    const items = await this.findManyProjectsCore(
      {
        status: "published",
        ...(orgId ? { org_id: orgId } : {})
      },
      { created_at: "desc" }
    );
    return items.map((p) => this.mapDbProject(p));
  }

  async findOne(id: string): Promise<Project | null> {
    const p = await this.findUniqueProjectCore({ id });
    if (!p) return null;
    return this.mapDbProject(p);
  }

  async update(
    id: string,
    dto: ProjectUpdateDto,
    currentUserId: string
  ): Promise<Project> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) {
      throw new ForbiddenException("Current user is not a startup owner");
    }

    const existing = await this.prisma.project.findUnique({
      where: { id }
    });
    if (!existing || existing.startup_id !== startup.id) {
      throw new ForbiddenException("You cannot edit this project");
    }

    const downgrade = this.shouldDowngradeIecLevel(existing, dto);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        summary: dto.summary ?? existing.summary,
        description: dto.description ?? existing.description,
        hero_image_url:
          dto.hero_image_url !== undefined
            ? dto.hero_image_url
            : existing.hero_image_url,
        industry: dto.industry ?? existing.industry,
        stage: dto.stage ?? existing.stage,
        funding_need_amount:
          dto.funding_need_amount !== undefined
            ? dto.funding_need_amount
            : existing.funding_need_amount,
        funding_currency:
          dto.funding_currency !== undefined
            ? dto.funding_currency
            : existing.funding_currency,
        ...(downgrade ? { iec_level: "L0" } : {}),
        // p1-9: cập nhật last_activity_at khi project được chỉnh sửa
        last_activity_at: new Date()
      }
    });

    return this.mapDbProject(updated);
  }

  async updateStatus(
    id: string,
    status: Project["status"],
    currentUserId: string
  ): Promise<Project> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) {
      throw new ForbiddenException("Current user is not a startup owner");
    }

    const existing = await this.prisma.project.findUnique({
      where: { id }
    });
    if (!existing || existing.startup_id !== startup.id) {
      throw new ForbiddenException("You cannot change status of this project");
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        status,
        // p1-9: cập nhật last_activity_at khi status thay đổi (publish/archive là hành động vận hành)
        last_activity_at: new Date()
      }
    });

    return this.mapDbProject(updated);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) {
      throw new ForbiddenException("Current user is not a startup owner");
    }

    const existing = await this.prisma.project.findUnique({
      where: { id }
    });
    if (!existing || existing.startup_id !== startup.id) {
      throw new ForbiddenException("You cannot archive this project");
    }

    await this.prisma.project.update({
      where: { id },
      data: {
        status: "archived"
      }
    });
  }
}

