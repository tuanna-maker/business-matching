import { Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, new RolesGuard(["admin", "iec_staff"] as any))
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("dashboard/metrics")
  async getMetrics() {
    const [
      startupCount,
      investorCount,
      projectCount,
      matchCount,
      l0Count,
      l1Count,
      l3Count
    ] = await Promise.all([
      this.prisma.startupProfile.count(),
      this.prisma.investorProfile.count(),
      this.prisma.project.count(),
      this.prisma.match.count(),
      this.prisma.project.count({ where: { iec_level: "L0" } }),
      this.prisma.project.count({ where: { iec_level: "L1" } }),
      this.prisma.project.count({ where: { iec_level: "L3" } })
    ]);

    return {
      startups: startupCount,
      investors: investorCount,
      projects: projectCount,
      matches: matchCount,
      iec_distribution: {
        L0: l0Count,
        L1: l1Count,
        L3: l3Count
      }
    };
  }

  @Get("audit-logs")
  async getAuditLogs(
    @Query("actor_id") _actorId?: string,
    @Query("entity_type") _entityType?: string,
    @Query("org_id") _orgId?: string,
    @Query("from") _from?: string,
    @Query("to") _to?: string,
    @Query("skip") _skip?: string,
    @Query("take") _take?: string
  ) {
    const where: any = {};
    if (_actorId) where.actor_id = _actorId;
    if (_entityType) where.entity_type = _entityType;
    if (_orgId) where.org_id = _orgId;

    if (_from || _to) {
      where.created_at = {};
      if (_from) {
        where.created_at.gte = new Date(_from);
      }
      if (_to) {
        where.created_at.lte = new Date(_to);
      }
    }

    const skip = _skip ? Number(_skip) : 0;
    const take = _take ? Number(_take) : 100;

    const logs = await this.prisma.auditLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take
    });

    return logs;
  }

  @Get("matches")
  async listMatches() {
    const matches = await this.prisma.match.findMany({
      orderBy: { created_at: "desc" },
      take: 200
    });
    return matches;
  }

  @Get("approvals/pending")
  async listPendingApprovals() {
    const users = await this.prisma.user.findMany({
      where: {
        approval_status: "pending",
        user_type: { in: ["startup", "investor"] }
      },
      include: {
        startup_profile: true,
        investor_profile: true
      },
      orderBy: { created_at: "desc" },
      take: 200
    });

    return {
      pending: users.map((u) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        user_type: u.user_type,
        approval_status: u.approval_status,
        created_at: u.created_at,
        company_name: u.startup_profile?.company_name ?? null,
        organization_name: u.investor_profile?.company_name ?? null
      }))
    };
  }

  @Post("approvals/users/:id/approve")
  async approveUser(@Param("id") id: string, @Req() req: any) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        approval_status: "approved",
        approved_at: new Date(),
        approved_by: req.user?.id ?? null
      }
    });
    return {
      id: updated.id,
      approval_status: updated.approval_status,
      approved_at: updated.approved_at
    };
  }

  @Post("approvals/users/:id/reject")
  async rejectUser(@Param("id") id: string, @Req() req: any) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        approval_status: "rejected",
        approved_at: new Date(),
        approved_by: req.user?.id ?? null
      }
    });
    return {
      id: updated.id,
      approval_status: updated.approval_status,
      approved_at: updated.approved_at
    };
  }
}

