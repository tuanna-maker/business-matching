export type UUID = string;

export type OrgId = UUID;

export interface BaseEntity {
  id: UUID;
  org_id: OrgId | null;
  created_at: string;
  updated_at: string;
  created_by: UUID | null;
}

export enum UserType {
  STARTUP = "startup",
  INVESTOR = "investor",
  ADMIN = "admin",
  IEC_STAFF = "iec_staff"
}

export enum AccountApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

export interface User extends BaseEntity {
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  user_type: UserType;
  approval_status?: AccountApprovalStatus;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterStartupRequest {
  full_name: string;
  email: string;
  password: string;
  company_name: string;
}

export interface RegisterInvestorRequest {
  full_name: string;
  email: string;
  password: string;
  organization_name: string;
}

export interface MeResponse {
  user: User;
}

