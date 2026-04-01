import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AnalyticsService } from "./analytics.service";

/**
 * Analytics Controller (Epic 5.2)
 * Provides endpoints for Business Intelligence dashboard
 */
@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get ecosystem overview statistics
   */
  @Get("overview")
  async getOverview() {
    return this.analyticsService.getEcosystemOverview();
  }

  /**
   * Get industry distribution
   */
  @Get("industries")
  async getIndustries() {
    return this.analyticsService.getIndustryDistribution();
  }

  /**
   * Get funding stage distribution
   */
  @Get("stages")
  async getStages() {
    return this.analyticsService.getStageDistribution();
  }

  /**
   * Get IEC level distribution
   */
  @Get("iec-distribution")
  async getIecDistribution() {
    return this.analyticsService.getIecDistribution();
  }

  /**
   * Get capital flow trends
   */
  @Get("capital-flow")
  async getCapitalFlow(@Query("months") months?: string) {
    const monthsNum = months ? parseInt(months, 10) : 6;
    return this.analyticsService.getCapitalFlow(monthsNum);
  }

  /**
   * Get pipeline funnel statistics
   */
  @Get("pipeline-funnel")
  async getPipelineFunnel() {
    return this.analyticsService.getPipelineFunnel();
  }

  /**
   * Get trust score distribution
   */
  @Get("trust-scores")
  async getTrustScores() {
    return this.analyticsService.getTrustScoreDistribution();
  }

  /**
   * Get recent activity for audit/monitoring
   */
  @Get("activity")
  async getActivity(@Query("limit") limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.analyticsService.getRecentActivity(limitNum);
  }

  /**
   * Get all dashboard data in one call
   */
  @Get("dashboard")
  async getDashboard() {
    const [
      overview,
      industries,
      stages,
      iecDistribution,
      capitalFlow,
      pipelineFunnel,
      trustScores
    ] = await Promise.all([
      this.analyticsService.getEcosystemOverview(),
      this.analyticsService.getIndustryDistribution(),
      this.analyticsService.getStageDistribution(),
      this.analyticsService.getIecDistribution(),
      this.analyticsService.getCapitalFlow(6),
      this.analyticsService.getPipelineFunnel(),
      this.analyticsService.getTrustScoreDistribution()
    ]);

    return {
      overview,
      industries,
      stages,
      iec_distribution: iecDistribution,
      capital_flow: capitalFlow,
      pipeline_funnel: pipelineFunnel,
      trust_scores: trustScores
    };
  }
}
