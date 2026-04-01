import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import type {
  AssessmentStatus,
  IecCriterion,
  IecLevelDefinition,
  ProjectIecAssessment,
  ProjectIecScore
} from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { IecService } from "./iec.service";
import { TrustScoreService } from "./trust-score.service";
import { VouchService } from "./vouch.service";

@Controller()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class IecController {
  constructor(
    private readonly iecService: IecService,
    private readonly trustScoreService: TrustScoreService,
    private readonly vouchService: VouchService
  ) {}

  @Get("iec/levels")
  getLevels(@Req() req: any): Promise<IecLevelDefinition[]> {
    const orgId: string | null = (req.user?.org_id as string) ?? null;
    return this.iecService.getLevels(orgId);
  }

  @Get("iec/criteria")
  getCriteria(@Req() req: any): Promise<IecCriterion[]> {
    const orgId: string | null = (req.user?.org_id as string) ?? null;
    return this.iecService.getCriteria(orgId);
  }

  @Post("iec/projects/:projectId/assessments")
  requestAssessment(
    @Param("projectId") projectId: string,
    @Req() req: any
  ): Promise<ProjectIecAssessment> {
    const currentUserId = req.user.id as string;
    return this.iecService.requestAssessment(projectId, currentUserId);
  }

  @Get("iec/projects/:projectId/assessments")
  getAssessmentsForProject(
    @Param("projectId") projectId: string
  ): Promise<ProjectIecAssessment[]> {
    return this.iecService.getAssessmentsForProject(projectId);
  }

  @Get("iec/assessments/:id")
  getAssessmentById(
    @Param("id") id: string
  ): Promise<ProjectIecAssessment | null> {
    return this.iecService.getAssessmentById(id);
  }

  @Post("iec/assessments/:id/scores")
  @UseGuards(new RolesGuard(["iec_staff", "admin"] as any))
  saveScores(
    @Param("id") id: string,
    @Body()
    body: {
      scores: Array<{
        criterion_id: number;
        score: number;
        comment?: string;
      }>;
    },
    @Req() req: any
  ): Promise<void> {
    const currentUserId = req.user.id as string;
    return this.iecService.saveScores(id, body.scores, currentUserId);
  }

  @Patch("iec/assessments/:id")
  @UseGuards(new RolesGuard(["iec_staff", "admin"] as any))
  updateAssessmentStatus(
    @Param("id") id: string,
    @Body()
    body: {
      status: AssessmentStatus;
      comments?: string;
    },
    @Req() req: any
  ): Promise<ProjectIecAssessment> {
    const currentUserId = req.user.id as string;
    return this.iecService.updateAssessmentStatus(
      id,
      body.status,
      body.comments,
      currentUserId
    );
  }

  @Patch("admin/iec/assessments/:id/finalize")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  finalizeAssessment(
    @Param("id") id: string,
    @Body()
    body: {
      final_level_id: number;
    },
    @Req() req: any
  ): Promise<ProjectIecAssessment> {
    const currentUserId = req.user.id as string;
    return this.iecService.finalizeAssessment(
      id,
      body.final_level_id,
      currentUserId
    );
  }

  // Admin IEC config – levels

  @Post("admin/iec/levels")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  createLevel(
    @Body()
    body: {
      code: IecLevelDefinition["code"];
      name: string;
      description?: string | null;
      order: number;
    },
    @Req() req: any
  ): Promise<IecLevelDefinition> {
    const currentUserId = req.user.id as string;
    const orgId: string | null = (req.user?.org_id as string) ?? null;
    return this.iecService.createLevel(
      {
        code: body.code,
        name: body.name,
        description: body.description ?? null,
        order: body.order
      },
      orgId,
      currentUserId
    );
  }

  @Patch("admin/iec/levels/:id")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  updateLevel(
    @Param("id") id: string,
    @Body()
    body: {
      name?: string;
      description?: string | null;
      order?: number;
    }
  ): Promise<IecLevelDefinition> {
    return this.iecService.updateLevel(Number(id), body);
  }

  @Post("admin/iec/levels/:id/delete")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  deleteLevel(@Param("id") id: string): Promise<void> {
    return this.iecService.deleteLevel(Number(id));
  }

  // Admin IEC config – criteria

  @Post("admin/iec/criteria")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  createCriterion(
    @Body()
    body: {
      iec_level_id: number;
      code: string;
      title: string;
      description?: string | null;
      weight?: number | null;
      is_required: boolean;
    },
    @Req() req: any
  ): Promise<IecCriterion> {
    const currentUserId = req.user.id as string;
    const orgId: string | null = (req.user?.org_id as string) ?? null;
    return this.iecService.createCriterion(
      {
        iec_level_id: body.iec_level_id,
        code: body.code,
        title: body.title,
        description: body.description ?? null,
        weight: body.weight ?? null,
        is_required: body.is_required
      } as any,
      orgId,
      currentUserId
    );
  }

  @Patch("admin/iec/criteria/:id")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  updateCriterion(
    @Param("id") id: string,
    @Body()
    body: {
      title?: string;
      description?: string | null;
      weight?: number | null;
      is_required?: boolean;
    }
  ): Promise<IecCriterion> {
    return this.iecService.updateCriterion(Number(id), body);
  }

  @Post("admin/iec/criteria/:id/delete")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  deleteCriterion(@Param("id") id: string): Promise<void> {
    return this.iecService.deleteCriterion(Number(id));
  }

  // IEC staff review list & scores

  @Get("iec/review")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  listAssessmentsForReview(@Req() req: any): Promise<ProjectIecAssessment[]> {
    const orgId: string | null = (req.user?.org_id as string) ?? null;
    return this.iecService.listAssessmentsForReview(orgId);
  }

  @Get("iec/assessments/:id/scores")
  @UseGuards(new RolesGuard(["admin", "iec_staff"] as any))
  getAssessmentScores(
    @Param("id") id: string
  ): Promise<ProjectIecScore[]> {
    return this.iecService.getScoresForAssessment(id);
  }

  // Trust Score Endpoints

  private async resolveTrustScore(orgId: string) {
    const row = await this.trustScoreService.getTrustScore(orgId);
    if (row) {
      return {
        score: row.score,
        profile_score: row.profile_score,
        iec_score: row.iec_score,
        vouch_score: row.vouch_score,
        audit_score: row.audit_score
      };
    }
    try {
      const calc = await this.trustScoreService.calculateTrustScore(orgId);
      return {
        score: calc.score,
        profile_score: calc.profileScore,
        iec_score: calc.iecScore,
        vouch_score: calc.vouchScore,
        audit_score: calc.auditScore
      };
    } catch {
      return null;
    }
  }

  @Get("org/:orgId/trust-score")
  async getTrustScore(@Param("orgId") orgId: string) {
    return this.resolveTrustScore(orgId);
  }

  /** Back-compat for older web clients that called `/iec/:orgId/trust-score`. */
  @Get("iec/:orgId/trust-score")
  async getTrustScoreLegacy(@Param("orgId") orgId: string) {
    return this.resolveTrustScore(orgId);
  }

  @Post("org/:orgId/trust-score/recalculate")
  async recalculateTrustScore(@Param("orgId") orgId: string) {
    return this.trustScoreService.updateTrustScore(orgId);
  }

  // Vouch Endpoints

  @Post("org/:orgId/vouch")
  async createVouch(
    @Param("orgId") orgId: string,
    @Body() body: {
      vouched_org_id: string;
      vouch_type: "partnership" | "transaction" | "reference";
      notes?: string;
    },
    @Req() req: any
  ) {
    const userOrgId = req.user.org_id as string;
    return this.vouchService.createVouch(
      userOrgId,
      body.vouched_org_id,
      body.vouch_type,
      body.notes
    );
  }

  @Get("org/:orgId/vouches")
  async getVouchesForOrg(@Param("orgId") orgId: string) {
    return this.vouchService.getVouchesForOrg(orgId);
  }

  @Get("org/:orgId/vouches-given")
  async getVouchesByOrg(@Param("orgId") orgId: string) {
    return this.vouchService.getVouchesByOrg(orgId);
  }

  @Post("org/:orgId/vouch/revoke")
  async revokeVouch(
    @Param("orgId") orgId: string,
    @Body() body: { vouched_org_id: string },
    @Req() req: any
  ) {
    const userOrgId = req.user.org_id as string;
    return this.vouchService.revokeVouch(userOrgId, body.vouched_org_id);
  }
}

