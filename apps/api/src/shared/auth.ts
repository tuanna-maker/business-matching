export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: User;
  tokens: {
    accessToken: string;
  };
}

export interface User {
  id: string;
  org_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  user_type: UserType;
  approval_status: "pending" | "approved" | "rejected";
}

export enum UserType {
  ADMIN = "ADMIN",
  STARTUP = "STARTUP",
  INVESTOR = "INVESTOR"
}
