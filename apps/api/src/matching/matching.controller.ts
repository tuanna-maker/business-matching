import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import type { Match, MatchEvent, MatchIntent } from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { MatchingService } from "./matching.service";
import { MatchScoreService } from "./match-score.service";

@Controller()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class MatchingController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly matchScoreService: MatchScoreService
  ) {}

  @Get("discover/projects")
  @UseGuards(new RolesGuard(["investor"] as any))
  discoverProjects(
    @Query() query: Record<string, unknown>,
    @Req() req: any
  ): Promise<any[]> {
    const orgId = (req.user?.org_id as string) ?? null;
    const currentUserId = req.user.id as string;
    return this.matchingService.discoverProjects(query, orgId, currentUserId);
  }

  @Post("matching/intents")
  @UseGuards(new RolesGuard(["investor"] as any))
  createIntent(
    @Body()
    body: {
      project_id: string;
      status: MatchIntent["status"];
      source?: string;
    },
    @Req() req: any
  ): Promise<MatchIntent> {
    const currentUserId = req.user.id as string;
    return this.matchingService.createIntent(
      {
        project_id: body.project_id,
        status: body.status,
        source: body.source
      } as any,
      currentUserId
    );
  }

  @Get("matching/intents")
  listIntentsForCurrentInvestor(@Req() req: any): Promise<MatchIntent[]> {
    const currentUserId = req.user.id as string;
    return this.matchingService.listIntentsForCurrentInvestor(currentUserId);
  }

  @Get("matching/intents/:id")
  getIntentById(
    @Param("id") id: string
  ): Promise<MatchIntent | null> {
    return this.matchingService.getIntentById(id);
  }

  @Patch("matching/intents/:id")
  updateIntent(
    @Param("id") id: string,
    @Body() body: Partial<MatchIntent>,
    @Req() req: any
  ): Promise<MatchIntent> {
    const currentUserId = req.user.id as string;
    return this.matchingService.updateIntent(id, body, currentUserId);
  }

  @Post("matching/matches")
  createMatch(
    @Body() body: Omit<Match, "id" | "created_at" | "updated_at" | "created_by" | "org_id">,
    @Req() req: any
  ): Promise<Match> {
    const currentUserId = req.user.id as string;
    return this.matchingService.createMatch(body, currentUserId);
  }

  @Get("matching/matches")
  listMatchesForUser(@Req() req: any): Promise<Match[]> {
    const currentUserId = req.user.id as string;
    return this.matchingService.listMatchesForUser(currentUserId);
  }

  @Get("matching/matches/:id")
  getMatchById(
    @Param("id") id: string
  ): Promise<Match | null> {
    return this.matchingService.getMatchById(id);
  }

  @Patch("matching/matches/:id/status")
  updateMatchStatus(
    @Param("id") id: string,
    @Body()
    body: {
      status: Match["status"];
    },
    @Req() req: any
  ): Promise<Match> {
    const currentUserId = req.user.id as string;
    return this.matchingService.updateMatchStatus(id, body.status, currentUserId);
  }

  @Get("matching/matches/:id/events")
  listEvents(
    @Param("id") id: string
  ): Promise<MatchEvent[]> {
    return this.matchingService.listEvents(id);
  }

  @Post("matching/matches/:id/events")
  addEvent(
    @Param("id") id: string,
    @Body() body: Omit<MatchEvent, "id" | "created_at" | "updated_at" | "created_by" | "org_id" | "match_id">,
    @Req() req: any
  ): Promise<MatchEvent> {
    const currentUserId = req.user.id as string;
    return this.matchingService.addEvent(
      id,
      body,
      currentUserId
    );
  }

  // Match Score Endpoints

  @Get("org/:investorId/project/:projectId/match-score")
  async getMatchScore(
    @Param("investorId") investorId: string,
    @Param("projectId") projectId: string
  ) {
    return this.matchScoreService.getMatchScore(investorId, projectId);
  }

  @Get("org/:investorId/top-matches")
  async getTopMatchesForInvestor(
    @Param("investorId") investorId: string,
    @Query("limit") limit: number = 10
  ) {
    return this.matchScoreService.getTopMatchesForInvestor(investorId, limit);
  }
}
