import { Injectable, ForbiddenException } from "@nestjs/common";
import type { Notification as NotificationDto } from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";
import { NotificationsGateway } from "./notifications.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway
  ) {}

  private map(db: any): NotificationDto {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.created_at.toISOString(),
      created_by: null,
      recipient_user_id: db.recipient_user_id,
      type: db.type,
      payload: db.payload ?? null,
      read_at: db.read_at ? db.read_at.toISOString() : null
    };
  }

  async listForUser(userId: string): Promise<NotificationDto[]> {
    const items = await this.prisma.notification.findMany({
      where: { recipient_user_id: userId },
      orderBy: { created_at: "desc" },
      take: 100
    });
    return items.map((n) => this.map(n));
  }

  async markRead(id: string, userId: string): Promise<NotificationDto> {
    const existing = await this.prisma.notification.findUnique({
      where: { id }
    });
    if (!existing || existing.recipient_user_id !== userId) {
      throw new ForbiddenException("You cannot modify this notification");
    }
    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        read_at: new Date()
      }
    });
    return this.map(updated);
  }

  async createForUser(
    recipientUserId: string,
    type: string,
    payload: any,
    orgId?: string | null
  ): Promise<NotificationDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: recipientUserId }
    });
    if (!user) {
      throw new ForbiddenException("Recipient user not found");
    }
    const created = await this.prisma.notification.create({
      data: {
        id: randomUUID(),
        org_id: orgId ?? user.org_id,
        recipient_user_id: recipientUserId,
        type,
        payload
      }
    });
    const dto = this.map(created);
    this.gateway.emitToUser(recipientUserId, dto);
    return dto;
  }
}

