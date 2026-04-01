import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type {
  IecCriterion,
  IecLevelDefinition,
  ProjectIecAssessment,
  ProjectIecScore
} from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { WebhookService } from "../notifications/webhook.service";

@Injectable()
export class IecService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhookService
  ) {}

  private mapLevel(db: any): IecLevelDefinition {
    return {
      id: db.id.toString(),
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      code: db.level,
      name: db.name,
      description: db.description ?? null,
      order: db.id
    };
  }

  private mapCriterion(db: any): IecCriterion {
    return {
      id: db.id.toString(),
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      iec_level_id: db.iec_level_id,
      code: db.title,
      title: db.title,
      description: db.description ?? null,
      weight: db.weight ? Number(db.weight) : null,
      is_required: db.is_required
    };
  }

  private mapAssessment(db: any): ProjectIecAssessment {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      project_id: db.project_id,
      assessor_id: db.assessor_id,
      target_level_id: db.target_level_id,
      final_level_id: db.final_level_id ?? null,
      status: db.status,
      comments: db.comments ?? null
    };
  }

  async getLevels(orgId?: string | null): Promise<IecLevelDefinition[]> {
    const where: any = {};
    if (orgId) {
      where.OR = [{ org_id: null }, { org_id: orgId }];
    }
    const levels = await this.prisma.iecLevel.findMany({
      where,
      orderBy: { id: "asc" }
    });
    return levels.map((l) => this.mapLevel(l));
  }

  async getCriteria(orgId?: string | null): Promise<IecCriterion[]> {
    const where: any = {};
    if (orgId) {
      where.OR = [{ org_id: null }, { org_id: orgId }];
    }
    const criteria = await this.prisma.iecCriterion.findMany({
      where,
      orderBy: [{ iec_level_id: "asc" }, { id: "asc" }]
    });
    return criteria.map((c) => this.mapCriterion(c));
  }

  async createLevel(
    dto: Pick<IecLevelDefinition, "code" | "name" | "description" | "order">,
    orgId: string | null,
    currentUserId: string
  ): Promise<IecLevelDefinition> {
    const created = await this.prisma.iecLevel.create({
      data: {
        org_id: orgId,
        level: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        created_by: currentUserId
      }
    });
    return this.mapLevel(created);
  }

  async updateLevel(
    id: number,
    dto: Partial<Pick<IecLevelDefinition, "name" | "description" | "order">>
  ): Promise<IecLevelDefinition> {
    const updated = await this.prisma.iecLevel.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description
      }
    });
    return this.mapLevel(updated);
  }

  async deleteLevel(id: number): Promise<void> {
    await this.prisma.iecLevel.delete({
      where: { id }
    });
  }

  async createCriterion(
    dto: Omit<IecCriterion, "id" | "created_at" | "updated_at" | "created_by">,
    orgId: string | null,
    currentUserId: string
  ): Promise<IecCriterion> {
    const created = await this.prisma.iecCriterion.create({
      data: {
        org_id: orgId,
        iec_level_id: dto.iec_level_id,
        title: dto.code || dto.title,
        description: dto.description ?? null,
        weight: dto.weight ?? null,
        is_required: dto.is_required,
        created_by: currentUserId
      }
    });
    return this.mapCriterion(created);
  }

  async updateCriterion(
    id: number,
    dto: Partial<
      Pick<IecCriterion, "title" | "description" | "weight" | "is_required">
    >
  ): Promise<IecCriterion> {
    const updated = await this.prisma.iecCriterion.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        weight: dto.weight ?? null,
        is_required: dto.is_required ?? undefined
      }
    });
    return this.mapCriterion(updated);
  }

  async deleteCriterion(id: number): Promise<void> {
    await this.prisma.iecCriterion.delete({
      where: { id }
    });
  }

  async requestAssessment(
    projectId: string,
    currentUserId: string
  ): Promise<ProjectIecAssessment> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        startup_profile: true
      }
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup || startup.id !== project.startup_id) {
      throw new ForbiddenException(
        "You are not allowed to request assessment for this project"
      );
    }

    const defaultLevel = await this.prisma.iecLevel.findFirst({
      orderBy: { id: "asc" }
    });
    if (!defaultLevel) {
      throw new NotFoundException("IEC levels not configured");
    }

    const created = await this.prisma.projectIecAssessment.create({
      data: {
        org_id: project.org_id,
        project_id: project.id,
        assessor_id: currentUserId,
        target_level_id: defaultLevel.id
      }
    });

    return this.mapAssessment(created);
  }

  async getAssessmentsForProject(
    projectId: string
  ): Promise<ProjectIecAssessment[]> {
    const items = await this.prisma.projectIecAssessment.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: "desc" }
    });
    return items.map((a) => this.mapAssessment(a));
  }

  async getAssessmentById(
    id: string
  ): Promise<ProjectIecAssessment | null> {
    const a = await this.prisma.projectIecAssessment.findUnique({
      where: { id }
    });
    if (!a) return null;
    return this.mapAssessment(a);
  }

  async saveScores(
    assessmentId: string,
    scores: Array<Pick<ProjectIecScore, "criterion_id" | "score" | "comment">>,
    currentUserId: string
  ): Promise<void> {
    const assessment = await this.prisma.projectIecAssessment.findUnique({
      where: { id: assessmentId }
    });
    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    for (const s of scores) {
      const existing = await this.prisma.projectIecScore.findFirst({
        where: { assessment_id: assessmentId, criterion_id: s.criterion_id }
      });
      if (existing) {
        await this.prisma.projectIecScore.update({
          where: { id: existing.id },
          data: { score: s.score, comment: s.comment ?? null }
        });
      } else {
        await this.prisma.projectIecScore.create({
          data: {
            org_id: assessment.org_id,
            assessment_id: assessmentId,
            criterion_id: s.criterion_id,
            score: s.score,
            comment: s.comment ?? null,
            created_by: currentUserId
          }
        });
      }
    }
  }

  async listAssessmentsForReview(
    orgId?: string | null
  ): Promise<ProjectIecAssessment[]> {
    const where: any = {
      status: "in_review"
    };
    if (orgId) {
      where.org_id = orgId;
    }
    const items = await this.prisma.projectIecAssessment.findMany({
      where,
      orderBy: { created_at: "desc" }
    });
    return items.map((a) => this.mapAssessment(a));
  }

  async getScoresForAssessment(
    assessmentId: string
  ): Promise<ProjectIecScore[]> {
    const scores = await this.prisma.projectIecScore.findMany({
      where: { assessment_id: assessmentId },
      orderBy: { criterion_id: "asc" }
    });
    return scores.map((s) => ({
      id: s.id,
      org_id: s.org_id ?? null,
      created_at: s.created_at.toISOString(),
      updated_at: s.updated_at.toISOString(),
      created_by: s.created_by ?? null,
      assessment_id: s.assessment_id,
      criterion_id: s.criterion_id,
      score: Number(s.score),
      comment: s.comment ?? null
    }));
  }

  async updateAssessmentStatus(
    id: string,
    status: ProjectIecAssessment["status"],
    comments: string | undefined,
    _currentUserId: string
  ): Promise<ProjectIecAssessment> {
    const updated = await this.prisma.projectIecAssessment.update({
      where: { id },
      data: {
        status,
        comments
      }
    });
    return this.mapAssessment(updated);
  }

  async finalizeAssessment(
    id: string,
    finalLevelId: number,
    _currentUserId: string
  ): Promise<ProjectIecAssessment> {
    const assessment = await this.prisma.projectIecAssessment.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            startup_profile: {
              include: {
                user: true
              }
            }
          }
        },
        IecLevel_ProjectIecAssessment_final_level_idToIecLevel: true
      }
    });
    if (!assessment) {
      throw new NotFoundException("Assessment not found");
    }

    const level = await this.prisma.iecLevel.findUnique({
      where: { id: finalLevelId }
    });
    if (!level) {
      throw new NotFoundException("IEC level not found");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const a = await tx.projectIecAssessment.update({
        where: { id },
        data: {
          final_level_id: finalLevelId,
          status: "approved"
        }
      });

      await tx.project.update({
        where: { id: assessment.project_id },
        data: {
          iec_level: level.level
        }
      });

      return a;
    });

    const startupUserId = assessment.project.startup_profile?.user_id;
    if (startupUserId) {
      await this.notifications.createForUser(
        startupUserId,
        "iec_level_updated",
        {
          project_id: assessment.project_id,
          final_level_code: level.level
        },
        assessment.org_id
      );
    }

    // Emit webhook event for external integrations
    if (assessment.org_id) {
      this.webhooks.deliverEvent(assessment.org_id, "iec_level_updated", {
        assessment_id: id,
        project_id: assessment.project_id,
        project_name: (assessment.project as any)?.name,
        previous_level: assessment.IecLevel_ProjectIecAssessment_final_level_idToIecLevel?.level,
        new_level: level.level,
        new_level_name: level.name
      });
    }

    return this.mapAssessment(updated);
  }
}

