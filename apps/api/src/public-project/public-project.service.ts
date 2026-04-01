import { Injectable, NotFoundException } from "@nestjs/common";
import type { Project } from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PublicProjectService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDbProject(db: any): Project {
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
      hero_image_url: db.hero_image_url ?? null,
      industry: db.industry ?? null,
      stage: db.stage ?? null,
      funding_need_amount: db.funding_need_amount
        ? Number(db.funding_need_amount)
        : null,
      funding_currency: db.funding_currency ?? null,
      status: db.status,
      iec_level: db.iec_level ?? null
    };
  }

  async getBySlug(slug: string): Promise<Project> {
    // Note: slug field doesn't exist in DB, using id instead
    const project = await this.prisma.project.findFirst({
      where: {
        id: slug,
        status: "published"
      }
    });
    if (!project) {
      throw new NotFoundException("Project not found or not published");
    }
    return this.mapDbProject(project);
  }
}

