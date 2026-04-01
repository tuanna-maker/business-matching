import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import type {
  CreateOrgInviteRequest,
  CreateOrgInviteResponse,
  ListOrgInvitesResponse,
  ListOrgMembersResponse,
  OrgProfileResponse,
  OrgUpdateRequest,
  RemoveMemberResponse,
  RevokeInviteResponse,
  UpdateMemberRoleRequest,
  UpdateMemberRoleResponse
} from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { OrgService } from "./org.service";

@Controller("org")
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get("profile")
  getProfile(@Req() req: any): Promise<OrgProfileResponse> {
    return this.orgService.getOrgProfile(req.user.id as string);
  }

  @Patch("profile")
  updateProfile(
    @Req() req: any,
    @Body() body: OrgUpdateRequest
  ): Promise<OrgProfileResponse> {
    return this.orgService.updateOrgProfile(req.user.id as string, body);
  }

  // ==========================================
  // Epic 1.3: Member Management Endpoints
  // ==========================================

  @Get("members")
  listMembers(@Req() req: any): Promise<ListOrgMembersResponse> {
    return this.orgService.listMembers(req.user.id as string);
  }

  @Patch("members/role")
  updateMemberRole(
    @Req() req: any,
    @Body() body: UpdateMemberRoleRequest
  ): Promise<UpdateMemberRoleResponse> {
    return this.orgService.updateMemberRole(req.user.id as string, body);
  }

  @Delete("members/:userId")
  removeMember(
    @Req() req: any,
    @Param("userId") userId: string
  ): Promise<RemoveMemberResponse> {
    return this.orgService.removeMember(req.user.id as string, userId);
  }

  // ==========================================
  // Invites Management
  // ==========================================

  @Get("invites")
  listInvites(@Req() req: any): Promise<ListOrgInvitesResponse> {
    return this.orgService.listInvites(req.user.id as string);
  }

  @Post("invites")
  createInvite(
    @Req() req: any,
    @Body() body: CreateOrgInviteRequest
  ): Promise<CreateOrgInviteResponse> {
    return this.orgService.createInvite(req.user.id as string, body);
  }

  @Delete("invites/:inviteId")
  revokeInvite(
    @Req() req: any,
    @Param("inviteId") inviteId: string
  ): Promise<RevokeInviteResponse> {
    return this.orgService.revokeInvite(req.user.id as string, inviteId);
  }
}

