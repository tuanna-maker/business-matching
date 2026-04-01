import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { InvestorProfile, Project } from '@prisma/client';

/**
 * Match Score Algorithm Implementation
 * Formula: Match Score = Σ (Criteria_Fit × Weight)
 *
 * Industry Fit (40%): So khớp ngành nghề kinh doanh
 * Stage Fit (30%): Giai đoạn phát triển (Seed, Series A, B...)
 * Funding Fit (20%): Khoảng vốn cần huy động so với khẩu vị của Investor
 * IEC Level Fit (10%): Yêu cầu tối thiểu về mức độ xác thực
 */
@Injectable()
export class MatchScoreService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate Industry Fit (40% weight)
   * Returns 0-100 based on industry match
   */
  calculateIndustryFit(investorIndustry: string, projectIndustry: string): number {
    // Exact match = 100
    if (investorIndustry.toLowerCase() === projectIndustry.toLowerCase()) {
      return 100;
    }

    // Partial match based on keywords
    const investorKeywords = this.extractIndustryKeywords(investorIndustry);
    const projectKeywords = this.extractIndustryKeywords(projectIndustry);

    const commonKeywords = investorKeywords.filter(keyword =>
      projectKeywords.includes(keyword)
    );

    // Score based on overlap
    if (investorKeywords.length === 0) return 0;
    return Math.round((commonKeywords.length / investorKeywords.length) * 100);
  }

  /**
   * Extract industry keywords for matching
   */
  private extractIndustryKeywords(industry: string): string[] {
    if (!industry) return [];

    // Normalize and split by common separators
    const normalized = industry.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .trim();

    // Split and remove common stop words
    const stopWords = new Set(['the', 'and', 'or', 'of', 'in', 'for', 'to', 'a', 'an']);
    return normalized
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Calculate Stage Fit (30% weight)
   * Returns 0-100 based on funding stage match
   */
  calculateStageFit(investorStage: string, projectStage: string): number {
    if (!investorStage || !projectStage) return 50; // Default middle score if unknown

    const stages = ['seed', 'pre-seed', 'series-a', 'series a', 'series-b', 'series b', 'series-c', 'series c', 'growth', 'late'];
    const investorStageNorm = investorStage.toLowerCase();
    const projectStageNorm = projectStage.toLowerCase();

    // Exact match
    if (investorStageNorm === projectStageNorm) return 100;

    // Get stage indices
    const investorIndex = stages.findIndex(s => investorStageNorm.includes(s));
    const projectIndex = stages.findIndex(s => projectStageNorm.includes(s));

    if (investorIndex === -1 || projectIndex === -1) return 50;

    // Calculate proximity score
    const distance = Math.abs(investorIndex - projectIndex);
    const maxDistance = stages.length - 1;
    return Math.round((1 - distance / maxDistance) * 100);
  }

  /**
   * Calculate Funding Fit (20% weight)
   * Returns 0-100 based on funding amount fit
   */
  calculateFundingFit(
    investorMin: number,
    investorMax: number,
    projectFunding: number
  ): number {
    if (investorMin === 0 && investorMax === 0) return 50; // Unknown investor range
    if (projectFunding === 0) return 50; // Unknown project funding

    // Perfect fit: project funding is within investor range
    if (projectFunding >= investorMin && projectFunding <= investorMax) {
      return 100;
    }

    // Partial fit: calculate how far outside the range
    if (projectFunding < investorMin) {
      const ratio = projectFunding / investorMin;
      return Math.max(0, Math.round(ratio * 80)); // Max 80 if below range
    }

    if (projectFunding > investorMax) {
      const ratio = investorMax / projectFunding;
      return Math.max(0, Math.round(ratio * 80)); // Max 80 if above range
    }

    return 50;
  }

  /**
   * Calculate IEC Level Fit (10% weight)
   * Returns 0-100 based on IEC level requirements
   */
  calculateIECLLevelFit(investorMinLevel: string, projectLevel: string): number {
    const levels = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
    
    const investorLevelIndex = levels.findIndex(l => l === investorMinLevel);
    const projectLevelIndex = levels.findIndex(l => l === projectLevel);

    if (investorLevelIndex === -1 || projectLevelIndex === -1) return 50;

    // Project meets or exceeds investor requirement
    if (projectLevelIndex >= investorLevelIndex) {
      return 100;
    }

    // Calculate partial fit based on gap
    const gap = investorLevelIndex - projectLevelIndex;
    const maxGap = levels.length - 1;
    return Math.max(0, Math.round((1 - gap / maxGap) * 70)); // Max 70 if below requirement
  }

  /**
   * Calculate overall match score between investor and project
   */
  async calculateMatchScore(
    investor: {
      investment_focus: string | null;
      investment_stage: string | null;
      investment_amount_min: number | null;
      investment_amount_max: number | null;
    },
    project: {
      industry: string | null;
      stage: string | null;
      funding_need_amount: number | null;
      iec_level: string | null;
    }
  ): Promise<{
    score: number;
    breakdown: {
      industryFit: number;
      stageFit: number;
      fundingFit: number;
      iecFit: number;
      weightedIndustry: number;
      weightedStage: number;
      weightedFunding: number;
      weightedIEC: number;
    };
  }> {
    const industryFit = this.calculateIndustryFit(
      investor.investment_focus || '',
      project.industry || ''
    );

    const stageFit = this.calculateStageFit(
      investor.investment_stage || '',
      project.stage || ''
    );

    const fundingFit = this.calculateFundingFit(
      Number(investor.investment_amount_min || 0),
      Number(investor.investment_amount_max || 0),
      Number(project.funding_need_amount || 0)
    );

    const iecFit = this.calculateIECLLevelFit(
      'L0', // Default min IEC level since InvestorProfile doesn't have this field
      project.iec_level || 'L0'
    );

    // Apply weights
    const weightedIndustry = industryFit * 0.4;
    const weightedStage = stageFit * 0.3;
    const weightedFunding = fundingFit * 0.2;
    const weightedIEC = iecFit * 0.1;

    // Calculate final score
    const score = weightedIndustry + weightedStage + weightedFunding + weightedIEC;

    return {
      score: Math.round(score * 100) / 100,
      breakdown: {
        industryFit,
        stageFit,
        fundingFit,
        iecFit,
        weightedIndustry,
        weightedStage,
        weightedFunding,
        weightedIEC
      }
    };
  }

  /**
   * Get match score for a specific investor-project pair
   */
  async getMatchScore(investorProfileId: string, projectId: string): Promise<{
    score: number;
    breakdown: Record<string, number>;
    investor: {
      id: string;
      company_name: string;
      industry: string;
      investment_stage: string;
      investment_min: number;
      investment_max: number;
      min_iec_level: string;
    };
    project: {
      id: string;
      name: string;
      industry: string;
      stage: string;
      funding_amount: number;
      iec_level: string;
    };
  } | null> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { id: investorProfileId },
      select: {
        id: true,
        company_name: true,
        investment_focus: true,
        investment_stage: true,
        investment_amount_min: true,
        investment_amount_max: true,
      },
    });

    if (!investor) return null;

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        industry: true,
        stage: true,
        funding_need_amount: true,
        iec_level: true,
      },
    });

    if (!project) return null;

    const result = await this.calculateMatchScore(
      {
        investment_focus: investor.investment_focus,
        investment_stage: investor.investment_stage,
        investment_amount_min: investor.investment_amount_min ? Number(investor.investment_amount_min) : null,
        investment_amount_max: investor.investment_amount_max ? Number(investor.investment_amount_max) : null,
      },
      {
        industry: project.industry,
        stage: project.stage,
        funding_need_amount: project.funding_need_amount ? Number(project.funding_need_amount) : null,
        iec_level: project.iec_level,
      }
    );

    return {
      ...result,
      investor: {
        id: investor.id,
        company_name: investor.company_name,
        industry: investor.investment_focus || '',
        investment_stage: investor.investment_stage || '',
        investment_min: investor.investment_amount_min ? Number(investor.investment_amount_min) : 0,
        investment_max: investor.investment_amount_max ? Number(investor.investment_amount_max) : 0,
        min_iec_level: 'L0',
      },
      project: {
        id: project.id,
        name: project.title,
        industry: project.industry || '',
        stage: project.stage || '',
        funding_amount: project.funding_need_amount ? Number(project.funding_need_amount) : 0,
        iec_level: project.iec_level || '',
      }
    };
  }

  /**
   * Get top matches for an investor
   */
  async getTopMatchesForInvestor(investorProfileId: string, limit: number = 10): Promise<{
    project_id: string;
    project_name: string;
    score: number;
    industry_fit: number;
    stage_fit: number;
    funding_fit: number;
    iec_fit: number;
  }[]> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { id: investorProfileId },
      select: {
        investment_focus: true,
        investment_stage: true,
        investment_amount_min: true,
        investment_amount_max: true,
      },
    });

    if (!investor) return [];

    // Get all active projects
    const projects = await this.prisma.project.findMany({
      where: {
        status: 'published',
      },
      select: {
        id: true,
        title: true,
        industry: true,
        stage: true,
        funding_need_amount: true,
        iec_level: true,
      },
    });

    // Calculate match scores for each project
    const matches = await Promise.all(
      projects.map(async (project) => {
        const result = await this.calculateMatchScore(
          {
            investment_focus: investor.investment_focus,
            investment_stage: investor.investment_stage,
            investment_amount_min: investor.investment_amount_min ? Number(investor.investment_amount_min) : null,
            investment_amount_max: investor.investment_amount_max ? Number(investor.investment_amount_max) : null,
          },
          {
            industry: project.industry,
            stage: project.stage,
            funding_need_amount: project.funding_need_amount ? Number(project.funding_need_amount) : null,
            iec_level: project.iec_level,
          }
        );
        return {
          project_id: project.id,
          project_name: project.title,
          score: result.score,
          industry_fit: result.breakdown.industryFit,
          stage_fit: result.breakdown.stageFit,
          funding_fit: result.breakdown.fundingFit,
          iec_fit: result.breakdown.iecFit,
        };
      })
    );

    // Sort by score descending
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
