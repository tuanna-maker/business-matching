import { Injectable } from "@nestjs/common";
import type { MeResponse, User } from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      org_id: dbUser.org_id ?? null,
      created_at: dbUser.created_at.toISOString(),
      updated_at: dbUser.updated_at.toISOString(),
      created_by: dbUser.created_by ?? null,
      full_name: dbUser.full_name,
      email: dbUser.email,
      phone: dbUser.phone ?? null,
      avatar_url: dbUser.avatar_url ?? null,
      user_type: dbUser.user_type as any,
      approval_status: (dbUser.approval_status ?? "pending") as any
    };
  }

  async getMe(userId: string): Promise<MeResponse> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!dbUser) {
      throw new Error("User not found");
    }
    return { user: this.mapDbUserToUser(dbUser) };
  }

  async updateMe(
    userId: string,
    payload: Partial<Pick<User, "full_name" | "phone" | "avatar_url">>
  ): Promise<MeResponse> {
    const dbUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: payload.full_name,
        phone: payload.phone,
        avatar_url: payload.avatar_url
      }
    });
    return { user: this.mapDbUserToUser(dbUser) };
  }
}

