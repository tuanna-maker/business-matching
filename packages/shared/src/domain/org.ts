import type { BaseEntity, UUID } from "./user";

export enum OrgType {
  STARTUP = "startup_org",
  INVESTOR = "investor_org",
  IEC = "iec_org",
  PLATFORM = "platform_admin"
}

export enum OrgVerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

export interface Organization extends BaseEntity {
  name: string;
  org_type?: OrgType | null;
  logo_url?: string | null;
  tax_id?: string | null;
  website?: string | null;
  // Epic 1.3: Advanced fields
  legal_representative?: string | null;
  business_sector?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  founding_year?: number | null;
  employee_count?: string | null;
  verification_status?: OrgVerificationStatus;
  verified_at?: string | null;
  verified_by?: UUID | null;
}

export interface OrgMember {
  id: UUID;
  user_id: UUID;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  role_code: OrgMemberRole;
  joined_at: string;
}

export type OrgMemberRole = "owner" | "admin" | "member" | "assessor";

export interface OrgProfileResponse {
  org: Organization;
  members?: OrgMember[];
}

export interface OrgUpdateRequest extends Partial<Pick<Organization, 
  | "name" 
  | "logo_url" 
  | "tax_id" 
  | "website"
  | "legal_representative"
  | "business_sector"
  | "description"
  | "address"
  | "phone"
  | "email"
  | "founding_year"
  | "employee_count"
>> {}

export enum OrgInviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export interface OrgInvite extends BaseEntity {
  email: string;
  role_code: "owner" | "member" | "assessor";
  token: string;
  status: OrgInviteStatus;
  expires_at: string;
  accepted_by?: UUID | null;
}

export interface CreateOrgInviteRequest {
  email: string;
  role_code: OrgInvite["role_code"];
}

export interface CreateOrgInviteResponse {
  invite: OrgInvite;
  invite_url: string;
}

export interface ListOrgInvitesResponse {
  invites: OrgInvite[];
}

// Epic 1.3: Member Management Types
export interface ListOrgMembersResponse {
  members: OrgMember[];
}

export interface UpdateMemberRoleRequest {
  user_id: UUID;
  role_code: OrgMemberRole;
}

export interface UpdateMemberRoleResponse {
  member: OrgMember;
}

export interface RemoveMemberRequest {
  user_id: UUID;
}

export interface RemoveMemberResponse {
  success: boolean;
}

export interface RevokeInviteRequest {
  invite_id: UUID;
}

export interface RevokeInviteResponse {
  success: boolean;
}

