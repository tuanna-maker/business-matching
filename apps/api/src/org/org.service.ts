import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException
} from "@nestjs/common";
import type {
  CreateOrgInviteRequest,
  CreateOrgInviteResponse,
  ListOrgInvitesResponse,
  ListOrgMembersResponse,
  OrgMember,
  OrgProfileResponse,
  OrgUpdateRequest,
  RemoveMemberResponse,
  RevokeInviteResponse,
  UpdateMemberRoleRequest,
  UpdateMemberRoleResponse
} from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDbOrg(db: any) {
    return {
      id: db.id,
      org_id: null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      name: db.name,
      org_type: db.org_type ?? null,
      logo_url: db.logo_url ?? null,
      tax_id: db.tax_id ?? null,
      website: db.website ?? null,
      // Epic 1.3: Advanced fields
      legal_representative: db.legal_representative ?? null,
      business_sector: db.business_sector ?? null,
      description: db.description ?? null,
      address: db.address ?? null,
      phone: db.phone ?? null,
      email: db.email ?? null,
      founding_year: db.founding_year ?? null,
      employee_count: db.employee_count ?? null,
      verification_status: db.verification_status ?? "pending",
      verified_at: db.verified_at?.toISOString() ?? null,
      verified_by: db.verified_by ?? null
    };
  }

  private mapMember(user: any, roleCode: string): OrgMember {
    return {
      id: user.id,
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      role_code: roleCode as OrgMember["role_code"],
      joined_at: user.created_at.toISOString()
    };
  }

  private mapInvite(db: any) {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      email: db.invitee_email,
      role_code: db.role_code,
      token: db.token,
      status: db.status,
      expires_at: db.expires_at.toISOString(),
      accepted_by: null
    };
  }

  private async requireOrgOwner(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { UserRole: { include: { Role: true } } }
    });
    if (!user || !user.org_id) {
      throw new ForbiddenException("User has no organization");
    }
    const roleCodes = (user.UserRole ?? []).map((ur: any) => ur.Role.code);
    // Backward compatible: if no roles assigned, treat as owner.
    if (roleCodes.length === 0) return;
    if (!roleCodes.includes("owner")) {
      throw new ForbiddenException("Only organization owner can perform this action");
    }
  }

  async getOrgProfile(currentUserId: string): Promise<OrgProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!user?.org_id) throw new ForbiddenException("User has no organization");
    const org = await this.prisma.org.findUnique({ where: { id: user.org_id } });
    if (!org) throw new NotFoundException("Organization not found");
    return { org: this.mapDbOrg(org) };
  }

  async updateOrgProfile(
    currentUserId: string,
    payload: OrgUpdateRequest
  ): Promise<OrgProfileResponse> {
    await this.requireOrgOwner(currentUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!user?.org_id) throw new ForbiddenException("User has no organization");

    const org = await this.prisma.org.update({
      where: { id: user.org_id },
      data: {
        name: payload.name,
        logo_url: payload.logo_url,
        tax_id: payload.tax_id,
        website: payload.website,
        // Epic 1.3: Advanced fields
        legal_representative: payload.legal_representative,
        business_sector: payload.business_sector,
        description: payload.description,
        address: payload.address,
        phone: payload.phone,
        email: payload.email,
        founding_year: payload.founding_year,
        employee_count: payload.employee_count,
        updated_at: new Date()
      }
    });
    return { org: this.mapDbOrg(org) };
  }

  async createInvite(
    currentUserId: string,
    payload: CreateOrgInviteRequest
  ): Promise<CreateOrgInviteResponse> {
    await this.requireOrgOwner(currentUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!user?.org_id) throw new ForbiddenException("User has no organization");

    const token = `${randomUUID()}-${Math.random().toString(16).slice(2)}`;
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const created = await this.prisma.orgInvite.create({
      data: {
        id: randomUUID(),
        org_id: user.org_id,
        inviter_id: currentUserId,
        invitee_email: payload.email.toLowerCase(),
        role_code: payload.role_code,
        token,
        expires_at: expires,
        created_by: currentUserId
      }
    });

    return {
      invite: this.mapInvite(created),
      invite_url: `http://localhost:5173/login?invite=${encodeURIComponent(token)}`
    };
  }

  async listInvites(currentUserId: string): Promise<ListOrgInvitesResponse> {
    await this.requireOrgOwner(currentUserId);
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!user?.org_id) throw new ForbiddenException("User has no organization");

    const items = await this.prisma.orgInvite.findMany({
      where: { org_id: user.org_id },
      orderBy: { created_at: "desc" }
    });
    return { invites: items.map((i) => this.mapInvite(i)) };
  }

  // ==========================================
  // Epic 1.3: Member Management Methods
  // ==========================================

  async listMembers(currentUserId: string): Promise<ListOrgMembersResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!user?.org_id) throw new ForbiddenException("User has no organization");

    const members = await this.prisma.user.findMany({
      where: { org_id: user.org_id },
      include: {
        UserRole: {
          include: { Role: true }
        }
      },
      orderBy: { created_at: "asc" }
    });

    return {
      members: members.map((m: any) => {
        const roleCode = m.UserRole?.[0]?.Role?.code ?? "member";
        return this.mapMember(m, roleCode);
      })
    };
  }

  async updateMemberRole(
    currentUserId: string,
    payload: UpdateMemberRoleRequest
  ): Promise<UpdateMemberRoleResponse> {
    await this.requireOrgOwner(currentUserId);
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!currentUser?.org_id) throw new ForbiddenException("User has no organization");

    // Cannot change own role
    if (payload.user_id === currentUserId) {
      throw new BadRequestException("Cannot change your own role");
    }

    // Verify target user belongs to same org
    const targetUser = await this.prisma.user.findUnique({
      where: { id: payload.user_id },
      include: { UserRole: { include: { Role: true } } }
    });
    if (!targetUser || targetUser.org_id !== currentUser.org_id) {
      throw new NotFoundException("User not found in organization");
    }

    // Get role id for the role_code
    const role = await this.prisma.role.findUnique({
      where: { code: payload.role_code }
    });
    if (!role) {
      throw new BadRequestException("Invalid role code");
    }

    // Delete existing roles and create new one
    await this.prisma.userRole.deleteMany({
      where: { user_id: payload.user_id }
    });
    await this.prisma.userRole.create({
      data: {
        user_id: payload.user_id,
        role_id: role.id
      }
    });

    return {
      member: this.mapMember(targetUser, payload.role_code)
    };
  }

  async removeMember(
    currentUserId: string,
    targetUserId: string
  ): Promise<RemoveMemberResponse> {
    await this.requireOrgOwner(currentUserId);
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!currentUser?.org_id) throw new ForbiddenException("User has no organization");

    // Cannot remove self
    if (targetUserId === currentUserId) {
      throw new BadRequestException("Cannot remove yourself from organization");
    }

    // Verify target user belongs to same org
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId }
    });
    if (!targetUser || targetUser.org_id !== currentUser.org_id) {
      throw new NotFoundException("User not found in organization");
    }

    // Remove user from org (set org_id to null)
    await this.prisma.user.update({
      where: { id: targetUserId },
      data: { org_id: null }
    });

    // Delete user roles
    await this.prisma.userRole.deleteMany({
      where: { user_id: targetUserId }
    });

    return { success: true };
  }

  async revokeInvite(
    currentUserId: string,
    inviteId: string
  ): Promise<RevokeInviteResponse> {
    await this.requireOrgOwner(currentUserId);
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId }
    });
    if (!currentUser?.org_id) throw new ForbiddenException("User has no organization");

    const invite = await this.prisma.orgInvite.findUnique({
      where: { id: inviteId }
    });
    if (!invite || invite.org_id !== currentUser.org_id) {
      throw new NotFoundException("Invite not found");
    }

    await this.prisma.orgInvite.update({
      where: { id: inviteId },
      data: { status: "revoked" }
    });

    return { success: true };
  }
}

