import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Org } from '@prisma/client';

/**
 * Trust Score Algorithm Implementation
 * Formula: Trust Score = (P × 0.2) + (V × 0.3) + (Vouch × 0.3) + (A × 0.2)
 *
 * Where:
 * - P (Profile Completeness): % of required fields completed
 * - V (Verification Status): pending=0, verified=100
 * - Vouch: Cross-verification from verified orgs (max 100)
 * - A (Audit History): Activity frequency and data transparency
 */
@Injectable()
export class TrustScoreService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate Profile Completeness Score (P)
   * Returns percentage of required fields completed (0-100)
   */
  calculateProfileCompleteness(org: Org): number {
    const requiredFields = {
      name: org.name,
      business_sector: org.business_sector,
      description: org.description,
      website: org.website,
      address: org.address,
      founding_year: org.founding_year,
      employee_count: org.employee_count,
      email: org.email,
      phone: org.phone,
      legal_representative: org.legal_representative,
      tax_id: org.tax_id,
      logo_url: org.logo_url,
    };

    const totalFields = Object.keys(requiredFields).length;
    const completedFields = Object.values(requiredFields).filter(
      (value) => value !== null && value !== undefined && value !== '',
    ).length;

    return (completedFields / totalFields) * 100;
  }

  /**
   * Calculate Verification Score (V)
   * Based on verification_status
   */
  calculateVerificationScore(verificationStatus: string | null): number {
    const statusScores: Record<string, number> = {
      'pending': 0,
      'in_review': 30,
      'verified': 100,
      'rejected': 0,
    };
    return statusScores[verificationStatus || 'pending'] || 0;
  }

  /**
   * Calculate Vouching Score (Vouch)
   * Based on number of active vouches from verified organizations
   * Max score = 100 (10+ active vouches)
   */
  async calculateVouchScore(orgId: string): Promise<number> {
    const activeVouches = await this.prisma.vouch.count({
      where: {
        vouched_org_id: orgId,
        status: 'active',
        vouchingOrg: {
          verification_status: 'verified', // Only count vouches from verified orgs
        },
      },
    });

    // Cap at 10 vouches for max score
    const cappedVouches = Math.min(activeVouches, 10);
    return (cappedVouches / 10) * 100;
  }

  /**
   * Calculate Audit History Score (A)
   * Based on recent activity and data update frequency
   */
  async calculateAuditScore(orgId: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await this.prisma.auditLog.count({
      where: {
        entity_type: 'organization',
        entity_id: orgId,
        created_at: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Score based on activity frequency
    // 0 activities = 0, 1-5 = 50, 6-10 = 75, 11+ = 100
    if (recentActivity === 0) return 0;
    if (recentActivity <= 5) return 50;
    if (recentActivity <= 10) return 75;
    return 100;
  }

  /**
   * Calculate Final Trust Score using the formula:
   * Trust Score = (P × 0.2) + (V × 0.3) + (Vouch × 0.3) + (A × 0.2)
   */
  async calculateTrustScore(orgId: string): Promise<{
    score: number;
    profileScore: number;
    iecScore: number;
    vouchScore: number;
    auditScore: number;
  }> {
    const org = await this.prisma.org.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      throw new Error(`Organization ${orgId} not found`);
    }

    const profileScore = this.calculateProfileCompleteness(org);
    const verificationScore = this.calculateVerificationScore(org.verification_status);
    const vouchScore = await this.calculateVouchScore(orgId);
    const auditScore = await this.calculateAuditScore(orgId);

    // Apply the formula
    const score =
      (profileScore * 0.2) +
      (verificationScore * 0.3) +
      (vouchScore * 0.3) +
      (auditScore * 0.2);

    return {
      score: Math.round(score * 100) / 100,
      profileScore: Math.round(profileScore * 100) / 100,
      iecScore: Math.round(verificationScore * 100) / 100,
      vouchScore: Math.round(vouchScore * 100) / 100,
      auditScore: Math.round(auditScore * 100) / 100,
    };
  }

  /**
   * Update or create TrustScore record for an organization
   */
  async updateTrustScore(orgId: string): Promise<{
    id: string;
    score: number;
    profile_score: number;
    iec_score: number;
    vouch_score: number;
    audit_score: number;
  }> {
    const scores = await this.calculateTrustScore(orgId);

    return this.prisma.trustScore.upsert({
      where: { org_id: orgId },
      create: {
        org_id: orgId,
        score: scores.score,
        profile_score: scores.profileScore,
        iec_score: scores.iecScore,
        vouch_score: scores.vouchScore,
        audit_score: scores.auditScore,
      },
      update: {
        score: scores.score,
        profile_score: scores.profileScore,
        iec_score: scores.iecScore,
        vouch_score: scores.vouchScore,
        audit_score: scores.auditScore,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get Trust Score for an organization
   */
  async getTrustScore(orgId: string): Promise<{
    score: number;
    profile_score: number;
    iec_score: number;
    vouch_score: number;
    audit_score: number;
  } | null> {
    return this.prisma.trustScore.findUnique({
      where: { org_id: orgId },
    });
  }

  /**
   * Get Trust Score Badge Level
   * Returns badge tier based on score
   */
  getBadgeLevel(score: number): 'platinum' | 'gold' | 'silver' | 'bronze' | 'none' {
    if (score >= 90) return 'platinum';
    if (score >= 75) return 'gold';
    if (score >= 60) return 'silver';
    if (score >= 40) return 'bronze';
    return 'none';
  }
}
