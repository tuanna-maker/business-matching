import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Vouch Service - Cross-verification between organizations
 * Allows verified organizations to vouch for other organizations
 */
@Injectable()
export class VouchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new vouch relationship
   * Only verified organizations can give vouches
   */
  async createVouch(
    vouchingOrgId: string,
    vouchedOrgId: string,
    vouchType: 'partnership' | 'transaction' | 'reference',
    notes?: string,
  ) {
    // Check if vouching org is verified
    const vouchingOrg = await this.prisma.org.findUnique({
      where: { id: vouchingOrgId },
    });

    if (!vouchingOrg) {
      throw new BadRequestException('Vouching organization not found');
    }

    if (vouchingOrg.verification_status !== 'verified') {
      throw new ForbiddenException(
        'Only verified organizations can give vouches',
      );
    }

    // Check if vouched org exists
    const vouchedOrg = await this.prisma.org.findUnique({
      where: { id: vouchedOrgId },
    });

    if (!vouchedOrg) {
      throw new BadRequestException('Vouched organization not found');
    }

    // Check if vouch already exists
    const existingVouch = await this.prisma.vouch.findUnique({
      where: {
        vouching_org_id_vouched_org_id: {
          vouching_org_id: vouchingOrgId,
          vouched_org_id: vouchedOrgId,
        },
      },
    });

    if (existingVouch) {
      throw new BadRequestException('Vouch already exists between these organizations');
    }

    // Create the vouch
    const vouch = await this.prisma.vouch.create({
      data: {
        vouching_org_id: vouchingOrgId,
        vouched_org_id: vouchedOrgId,
        vouch_type: vouchType,
        notes,
        status: 'active',
      },
      include: {
        vouchingOrg: {
          select: {
            id: true,
            name: true,
            verification_status: true,
          },
        },
        vouchedOrg: {
          select: {
            id: true,
            name: true,
            verification_status: true,
          },
        },
      },
    });

    // Update trust score for the vouched organization
    await this.updateVouchedOrgTrustScore(vouchedOrgId);

    return vouch;
  }

  /**
   * Revoke a vouch
   * Only the vouching organization can revoke their own vouch
   */
  async revokeVouch(
    vouchingOrgId: string,
    vouchedOrgId: string,
  ) {
    const vouch = await this.prisma.vouch.findUnique({
      where: {
        vouching_org_id_vouched_org_id: {
          vouching_org_id: vouchingOrgId,
          vouched_org_id: vouchedOrgId,
        },
      },
    });

    if (!vouch) {
      throw new BadRequestException('Vouch not found');
    }

    // Update vouch status
    await this.prisma.vouch.update({
      where: {
        vouching_org_id_vouched_org_id: {
          vouching_org_id: vouchingOrgId,
          vouched_org_id: vouchedOrgId,
        },
      },
      data: {
        status: 'revoked',
        updated_at: new Date(),
      },
    });

    // Update trust score for the vouched organization
    await this.updateVouchedOrgTrustScore(vouchedOrgId);

    return { success: true };
  }

  /**
   * Get all active vouches for an organization
   */
  async getVouchesForOrg(orgId: string) {
    return this.prisma.vouch.findMany({
      where: {
        vouched_org_id: orgId,
        status: 'active',
      },
      include: {
        vouchingOrg: {
          select: {
            id: true,
            name: true,
            verification_status: true,
            business_sector: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get all vouches given by an organization
   */
  async getVouchesByOrg(orgId: string) {
    return this.prisma.vouch.findMany({
      where: {
        vouching_org_id: orgId,
        status: 'active',
      },
      include: {
        vouchedOrg: {
          select: {
            id: true,
            name: true,
            verification_status: true,
            business_sector: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Update trust score for vouched organization
   */
  private async updateVouchedOrgTrustScore(orgId: string) {
    try {
      await this.prisma.trustScore.update({
        where: { org_id: orgId },
        data: {
          updated_at: new Date(),
        },
      });
    } catch (error) {
      // Trust score might not exist yet, will be created on next calculation
      console.log('Trust score will be recalculated on next access');
    }
  }
}
