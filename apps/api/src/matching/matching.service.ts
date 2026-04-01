import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException
} from "@nestjs/common";
import type {
  Match,
  MatchEvent,
  MatchIntent,
  PipelineStats,
  MatchWithDetails
} from "@iec-hub/shared";
import { MatchStatus, VALID_STAGE_TRANSITIONS } from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { WebhookService } from "../notifications/webhook.service";
import { randomUUID } from "crypto";

@Injectable()
export class MatchingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhookService
  ) {}

  private mapIntent(db: any): MatchIntent {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      investor_id: db.investor_id,
      project_id: db.project_id,
      status: db.status,
      source: db.source ?? null
    };
  }

  private mapMatch(db: any): Match {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      project_id: db.project_id,
      startup_id: db.startup_id,
      investor_id: db.investor_id,
      match_intent_id: db.match_intent_id ?? null,
      iec_level_at_match: db.iec_level_at_match ?? null,
      status: db.status
    };
  }

  private mapEvent(db: any): MatchEvent {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      match_id: db.match_id,
      event_type: db.event_type,
      old_status: db.old_status ?? null,
      new_status: db.new_status ?? null,
      actor_id: db.actor_id,
      note: db.note ?? null
    };
  }

  async discoverProjects(
    filters: Record<string, unknown>,
    orgId: string | null,
    currentUserId: string
  ): Promise<any[]> {
    const where: any = {
      status: "published",
      ...(orgId ? { org_id: orgId } : {})
    };

    if (typeof filters.iec_level === "string") {
      where.iec_level = filters.iec_level;
    }
    if (typeof filters.industry === "string") {
      where.industry = filters.industry;
    }
    if (typeof filters.stage === "string") {
      where.stage = filters.stage;
    }
    if (typeof filters.search === "string" && filters.search.trim() !== "") {
      const q = String(filters.search).trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } }
      ];
    }

    const investor = await this.prisma.investorProfile.findUnique({
      where: { user_id: currentUserId }
    });

    if (investor?.investment_focus === "basic") {
      where.iec_level = {
        not: "L3"
      };
    }

    const projects = await this.prisma.project.findMany({
      where,
      orderBy: { created_at: "desc" }
    });

    return projects;
  }

  async createIntent(
    dto: Pick<MatchIntent, "project_id" | "status" | "source">,
    currentUserId: string
  ): Promise<MatchIntent> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!investor) {
      throw new ForbiddenException("Current user is not an investor");
    }

    const project = await this.prisma.project.findUnique({
      where: { id: dto.project_id }
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }
    if (project.status !== "published") {
      throw new ForbiddenException("Project is not available for matching");
    }

    // Basic investor cannot express interest in L3 projects
    if (
      investor.investment_focus === "basic" &&
      project.iec_level === "L3" &&
      dto.status === "liked"
    ) {
      throw new ForbiddenException(
        "Basic investors cannot express interest in IEC Level 3 projects"
      );
    }

    const intent = await this.prisma.matchIntent.upsert({
      where: {
        investor_id_project_id: {
          investor_id: investor.id,
          project_id: dto.project_id
        }
      },
      update: {
        status: dto.status,
        source: dto.source ?? null
      },
      create: {
        id: randomUUID(),
        org_id: investor.org_id,
        investor_id: investor.id,
        project_id: dto.project_id,
        status: dto.status,
        source: dto.source ?? null,
        created_by: currentUserId
      }
    });

    return this.mapIntent(intent);
  }

  async listIntentsForCurrentInvestor(
    currentUserId: string
  ): Promise<MatchIntent[]> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!investor) {
      return [];
    }

    const items = await this.prisma.matchIntent.findMany({
      where: { investor_id: investor.id },
      orderBy: { created_at: "desc" }
    });
    return items.map((i) => this.mapIntent(i));
  }

  async getIntentById(id: string): Promise<MatchIntent | null> {
    const intent = await this.prisma.matchIntent.findUnique({
      where: { id }
    });
    if (!intent) return null;
    return this.mapIntent(intent);
  }

  async updateIntent(
    id: string,
    patch: Partial<MatchIntent>,
    currentUserId: string
  ): Promise<MatchIntent> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!investor) {
      throw new ForbiddenException("Current user is not an investor");
    }

    const existing = await this.prisma.matchIntent.findUnique({
      where: { id }
    });
    if (!existing || existing.investor_id !== investor.id) {
      throw new ForbiddenException("You cannot update this intent");
    }

    const updated = await this.prisma.matchIntent.update({
      where: { id },
      data: {
        status: patch.status ?? existing.status,
        source: patch.source ?? existing.source
      }
    });

    return this.mapIntent(updated);
  }

  async createMatch(
    dto: Omit<Match, "id" | "created_at" | "updated_at" | "created_by" | "org_id">,
    currentUserId: string
  ): Promise<Match> {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.project_id },
      include: {
        startup_profile: {
          include: {
            user: true
          }
        }
      }
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    // p1-8: kiểm tra duplicate match — cùng investor + project mà chưa ở terminal state
    const terminalStatuses: MatchStatus[] = [
      MatchStatus.CLOSED_DEAL,
      MatchStatus.CLOSED_LOST,
      MatchStatus.REJECTED
    ];
    const existingActive = await this.prisma.match.findFirst({
      where: {
        project_id: dto.project_id,
        investor_id: dto.investor_id,
        NOT: { status: { in: terminalStatuses as string[] } }
      }
    });
    if (existingActive) {
      throw new ConflictException(
        "BIZ_003: An active match already exists for this investor and project"
      );
    }

    const match = await this.prisma.match.create({
      data: {
        id: randomUUID(),
        org_id: project.org_id,
        project_id: dto.project_id,
        startup_id: dto.startup_id,
        investor_id: dto.investor_id,
        match_intent_id: dto.match_intent_id ?? null,
        iec_level_at_match: dto.iec_level_at_match ?? null,
        status: dto.status,
        created_by: currentUserId
      }
    });

    await this.prisma.matchEvent.create({
      data: {
        id: randomUUID(),
        org_id: match.org_id,
        match_id: match.id,
        event_type: "status_changed",
        old_status: null,
        new_status: match.status,
        actor_id: currentUserId,
        note: "Match created",
        created_by: currentUserId
      }
    });

    const mapped = this.mapMatch(match);

    const startupUserId = project.startup_profile.user_id;
    if (startupUserId) {
      await this.notifications.createForUser(
        startupUserId,
        "match_created_startup",
        {
          match_id: mapped.id,
          project_id: mapped.project_id,
          investor_id: mapped.investor_id
        },
        project.org_id
      );
    }

    const investor = await this.prisma.investorProfile.findUnique({
      where: { id: dto.investor_id },
      include: {
        user: true
      }
    });
    const investorUserId = investor?.user.id;
    if (investorUserId) {
      await this.notifications.createForUser(
        investorUserId,
        "match_created_investor",
        {
          match_id: mapped.id,
          project_id: mapped.project_id,
          startup_id: mapped.startup_id
        },
        project.org_id
      );
    }

    // Emit webhook event for external integrations
    if (project.org_id) {
      this.webhooks.deliverEvent(project.org_id, "match_created", {
        match_id: mapped.id,
        project_id: mapped.project_id,
        project_name: (project as any).name,
        startup_id: mapped.startup_id,
        investor_id: mapped.investor_id,
        status: mapped.status
      });
    }

    return mapped;
  }

  async listMatchesForUser(
    currentUserId: string
  ): Promise<Match[]> {
    const [startup, investor] = await Promise.all([
      this.prisma.startupProfile.findUnique({
        where: { user_id: currentUserId }
      }),
      this.prisma.investorProfile.findUnique({
        where: { user_id: currentUserId }
      })
    ]);

    const conditions: any[] = [];
    if (startup) {
      conditions.push({ startup_id: startup.id });
    }
    if (investor) {
      conditions.push({ investor_id: investor.id });
    }

    if (!conditions.length) {
      return [];
    }

    const matches = await this.prisma.match.findMany({
      where: {
        OR: conditions
      },
      orderBy: { created_at: "desc" }
    });

    return matches.map((m) => this.mapMatch(m));
  }

  async getMatchById(id: string): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({
      where: { id }
    });
    if (!match) return null;
    return this.mapMatch(match);
  }

  async updateMatchStatus(
    id: string,
    status: Match["status"],
    currentUserId: string
  ): Promise<Match> {
    const match = await this.prisma.match.findUnique({
      where: { id }
    });
    if (!match) {
      throw new NotFoundException("Match not found");
    }

    // p1-7: enforce state machine — chỉ cho phép transition hợp lệ theo VALID_STAGE_TRANSITIONS
    const currentStatus = match.status as MatchStatus;
    const allowed: MatchStatus[] = VALID_STAGE_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(status as MatchStatus)) {
      throw new ConflictException(
        `BIZ_003: Transition from '${currentStatus}' to '${status}' is not allowed`
      );
    }

    const updated = await this.prisma.match.update({
      where: { id },
      data: {
        status
      }
    });

    await this.prisma.matchEvent.create({
      data: {
        id: randomUUID(),
        org_id: updated.org_id,
        match_id: updated.id,
        event_type: "status_changed",
        old_status: match.status,
        new_status: updated.status,
        actor_id: currentUserId,
        note: null,
        created_by: currentUserId
      }
    });

    return this.mapMatch(updated);
  }

  async listEvents(matchId: string): Promise<MatchEvent[]> {
    const events = await this.prisma.matchEvent.findMany({
      where: { match_id: matchId },
      orderBy: { created_at: "asc" }
    });
    return events.map((e) => this.mapEvent(e));
  }

  async addEvent(
    matchId: string,
    dto: Omit<
      MatchEvent,
      "id" | "created_at" | "updated_at" | "created_by" | "org_id" | "match_id"
    >,
    currentUserId: string
  ): Promise<MatchEvent> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId }
    });
    if (!match) {
      throw new NotFoundException("Match not found");
    }

    const created = await this.prisma.matchEvent.create({
      data: {
        id: randomUUID(),
        org_id: match.org_id,
        match_id: matchId,
        event_type: dto.event_type,
        old_status: dto.old_status ?? null,
        new_status: dto.new_status ?? null,
        actor_id: currentUserId,
        note: dto.note ?? null,
        created_by: currentUserId
      }
    });

    return this.mapEvent(created);
  }

  // ============= Pipeline Management (Epic 4.3) =============

  /**
   * Transition match to next pipeline stage with validation
   */
  async transitionStage(
    matchId: string,
    newStatus: MatchStatus,
    note: string | undefined,
    currentUserId: string
  ): Promise<Match> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        project: { include: { startup_profile: { include: { user: true } } } },
        investor_profile: { include: { user: true } }
      }
    });
    if (!match) {
      throw new NotFoundException("Match not found");
    }

    const currentStatus = match.status as MatchStatus;
    const validTransitions = VALID_STAGE_TRANSITIONS[currentStatus] || [];

    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions.join(", ") || "none (terminal state)"}`
      );
    }

    const updated = await this.prisma.match.update({
      where: { id: matchId },
      data: { status: newStatus }
    });

    // Log the transition event
    await this.prisma.matchEvent.create({
      data: {
        id: randomUUID(),
        org_id: updated.org_id,
        match_id: updated.id,
        event_type: "status_changed",
        old_status: currentStatus,
        new_status: newStatus,
        actor_id: currentUserId,
        note: note ?? `Stage transitioned from ${currentStatus} to ${newStatus}`,
        created_by: currentUserId
      }
    });

    // Notify both parties
    const startupUserId = match.project?.startup_profile?.user_id;
    const investorUserId = match.investor_profile?.user_id;

    const notificationPayload = {
      match_id: matchId,
      project_id: match.project_id,
      old_status: currentStatus,
      new_status: newStatus
    };

    if (startupUserId) {
      await this.notifications.createForUser(
        startupUserId,
        "match_stage_changed",
        notificationPayload,
        match.org_id
      );
    }

    if (investorUserId && investorUserId !== currentUserId) {
      await this.notifications.createForUser(
        investorUserId,
        "match_stage_changed",
        notificationPayload,
        match.org_id
      );
    }

    // Emit webhook event for external integrations
    if (match.org_id) {
      const isClosedDeal = [MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST, MatchStatus.REJECTED].includes(newStatus);
      const eventType = isClosedDeal ? "match_deal_closed" : "match_stage_changed";

      this.webhooks.deliverEvent(match.org_id, eventType, {
        match_id: matchId,
        project_id: match.project_id,
        project_name: (match.project as any)?.name,
        startup_id: match.startup_id,
        investor_id: match.investor_id,
        old_status: currentStatus,
        new_status: newStatus,
        ...(isClosedDeal && { outcome: newStatus === MatchStatus.CLOSED_DEAL ? "won" : "lost" })
      });
    }

    return this.mapMatch(updated);
  }

  /**
   * Get detailed match with related data and timeline
   */
  async getMatchWithDetails(matchId: string): Promise<MatchWithDetails | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        project: true,
        startup_profile: { include: { user: true } },
        investor_profile: { include: { user: true } },
        match_events: { orderBy: { created_at: "asc" } }
      }
    });

    if (!match) return null;

    // Calculate days in current stage
    const lastStatusChange = await this.prisma.matchEvent.findFirst({
      where: {
        match_id: matchId,
        event_type: "status_changed",
        new_status: match.status
      },
      orderBy: { created_at: "desc" }
    });

    const stageStartDate = lastStatusChange?.created_at ?? match.created_at;
    const daysInStage = Math.floor(
      (Date.now() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ...this.mapMatch(match),
      project: {
        id: match.project.id,
        title: match.project.title,
        industry: match.project.industry ?? null,
        stage: match.project.stage ?? null
      },
      startup: {
        id: match.startup_profile.id,
        company_name: match.startup_profile.company_name,
        user: {
          full_name: match.startup_profile.user.full_name,
          email: match.startup_profile.user.email
        }
      },
      investor: {
        id: match.investor_profile.id,
        company_name: match.investor_profile.company_name,
        user: {
          full_name: match.investor_profile.user.full_name,
          email: match.investor_profile.user.email
        }
      },
      events: match.match_events.map((e: any) => this.mapEvent(e)),
      days_in_current_stage: daysInStage
    };
  }

  /**
   * Get pipeline statistics for analytics dashboard
   */
  async getPipelineStats(orgId?: string): Promise<PipelineStats> {
    const where = orgId ? { org_id: orgId } : {};

    // Get all matches
    const matches = await this.prisma.match.findMany({ where });

    // Count by stage
    const byStage: Record<string, number> = {};
    for (const status of Object.values(MatchStatus)) {
      byStage[status] = matches.filter(m => m.status === status).length;
    }

    // Calculate conversion rates
    const totalMatches = matches.length;
    const introDone = matches.filter(m => 
      m.status !== MatchStatus.PENDING_INTRO && m.status !== MatchStatus.REJECTED
    ).length;
    const inDiscussion = matches.filter(m =>
      [MatchStatus.IN_DISCUSSION, MatchStatus.MEETING_SCHEDULED, MatchStatus.DUE_DILIGENCE, 
       MatchStatus.NEGOTIATION, MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST].includes(m.status as MatchStatus)
    ).length;
    const meetingScheduled = matches.filter(m =>
      [MatchStatus.MEETING_SCHEDULED, MatchStatus.DUE_DILIGENCE, 
       MatchStatus.NEGOTIATION, MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST].includes(m.status as MatchStatus)
    ).length;
    const dueDiligence = matches.filter(m =>
      [MatchStatus.DUE_DILIGENCE, MatchStatus.NEGOTIATION, 
       MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST].includes(m.status as MatchStatus)
    ).length;
    const negotiation = matches.filter(m =>
      [MatchStatus.NEGOTIATION, MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST].includes(m.status as MatchStatus)
    ).length;
    const closedDeal = matches.filter(m => m.status === MatchStatus.CLOSED_DEAL).length;
    const closedTotal = matches.filter(m => 
      [MatchStatus.CLOSED_DEAL, MatchStatus.CLOSED_LOST].includes(m.status as MatchStatus)
    ).length;

    const safeDiv = (a: number, b: number) => b > 0 ? Math.round((a / b) * 100) : 0;

    // Get average days in each stage (simplified - would need more detailed event tracking in production)
    const avgDaysInStage: Record<string, number> = {};
    for (const status of Object.values(MatchStatus)) {
      avgDaysInStage[status] = 0; // Placeholder - would calculate from event history
    }

    return {
      total_matches: totalMatches,
      by_stage: byStage as Record<MatchStatus, number>,
      conversion_rates: {
        intro_to_discussion: safeDiv(inDiscussion, introDone),
        discussion_to_meeting: safeDiv(meetingScheduled, inDiscussion),
        meeting_to_dd: safeDiv(dueDiligence, meetingScheduled),
        dd_to_negotiation: safeDiv(negotiation, dueDiligence),
        negotiation_to_closed: safeDiv(closedDeal, negotiation),
        overall_win_rate: safeDiv(closedDeal, closedTotal)
      },
      avg_days_in_stage: avgDaysInStage as Record<MatchStatus, number>
    };
  }

  /**
   * Get matches in a specific pipeline stage
   */
  async getMatchesByStage(
    stage: MatchStatus,
    currentUserId: string
  ): Promise<MatchWithDetails[]> {
    const [startup, investor] = await Promise.all([
      this.prisma.startupProfile.findUnique({ where: { user_id: currentUserId } }),
      this.prisma.investorProfile.findUnique({ where: { user_id: currentUserId } })
    ]);

    const conditions: any[] = [];
    if (startup) conditions.push({ startup_id: startup.id });
    if (investor) conditions.push({ investor_id: investor.id });

    if (!conditions.length) return [];

    const matches = await this.prisma.match.findMany({
      where: {
        status: stage,
        OR: conditions
      },
      include: {
        project: true,
        startup_profile: { include: { user: true } },
        investor_profile: { include: { user: true } },
        match_events: { orderBy: { created_at: "desc" }, take: 1 }
      },
      orderBy: { updated_at: "desc" }
    });

    return matches.map((m: any) => {
      const lastEvent = m.match_events[0];
      const stageStartDate = lastEvent?.created_at ?? m.created_at;
      const daysInStage = Math.floor(
        (Date.now() - stageStartDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...this.mapMatch(m),
        project: {
          id: m.project.id,
          title: m.project.title,
          industry: m.project.industry ?? null,
          stage: m.project.stage ?? null
        },
        startup: {
          id: m.startup_profile.id,
          company_name: m.startup_profile.company_name,
          user: {
            full_name: m.startup_profile.user.full_name,
            email: m.startup_profile.user.email
          }
        },
        investor: {
          id: m.investor_profile.id,
          company_name: m.investor_profile.company_name,
          user: {
            full_name: m.investor_profile.user.full_name,
            email: m.investor_profile.user.email
          }
        },
        days_in_current_stage: daysInStage
      };
    });
  }

  /**
   * Schedule a meeting for a match (transitions to MEETING_SCHEDULED)
   */
  async scheduleMeeting(
    matchId: string,
    meetingDetails: { scheduled_at: string; location?: string; meeting_link?: string; notes?: string },
    currentUserId: string
  ): Promise<Match> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId }
    });
    if (!match) throw new NotFoundException("Match not found");

    // Must be in discussion phase to schedule meeting
    if (match.status !== MatchStatus.IN_DISCUSSION) {
      throw new BadRequestException(
        `Cannot schedule meeting. Match must be in '${MatchStatus.IN_DISCUSSION}' stage.`
      );
    }

    // Add meeting event
    await this.prisma.matchEvent.create({
      data: {
        id: randomUUID(),
        org_id: match.org_id,
        match_id: matchId,
        event_type: "meeting_scheduled",
        old_status: match.status,
        new_status: MatchStatus.MEETING_SCHEDULED,
        actor_id: currentUserId,
        note: `Meeting scheduled for ${meetingDetails.scheduled_at}. ${meetingDetails.notes ?? ""}`,
        created_by: currentUserId
      }
    });

    return this.transitionStage(matchId, MatchStatus.MEETING_SCHEDULED, meetingDetails.notes, currentUserId);
  }

  /**
   * Start due diligence process
   */
  async startDueDiligence(
    matchId: string,
    notes: string | undefined,
    currentUserId: string
  ): Promise<Match> {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException("Match not found");

    if (match.status !== MatchStatus.MEETING_SCHEDULED) {
      throw new BadRequestException(
        `Cannot start DD. Match must be in '${MatchStatus.MEETING_SCHEDULED}' stage.`
      );
    }

    await this.prisma.matchEvent.create({
      data: {
        id: randomUUID(),
        org_id: match.org_id,
        match_id: matchId,
        event_type: "dd_started",
        old_status: match.status,
        new_status: MatchStatus.DUE_DILIGENCE,
        actor_id: currentUserId,
        note: notes ?? "Due diligence process initiated",
        created_by: currentUserId
      }
    });

    return this.transitionStage(matchId, MatchStatus.DUE_DILIGENCE, notes, currentUserId);
  }

  /**
   * Close deal (won or lost)
   */
  async closeDeal(
    matchId: string,
    outcome: "won" | "lost",
    notes: string | undefined,
    currentUserId: string
  ): Promise<Match> {
    const newStatus = outcome === "won" ? MatchStatus.CLOSED_DEAL : MatchStatus.CLOSED_LOST;
    return this.transitionStage(matchId, newStatus, notes, currentUserId);
  }
}


