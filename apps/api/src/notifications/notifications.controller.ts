import { Controller, Get, Patch, Param, Req, UseGuards } from "@nestjs/common";
import type { Notification } from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  listForCurrentUser(@Req() req: any): Promise<Notification[]> {
    const currentUserId = req.user.id as string;
    return this.notificationsService.listForUser(currentUserId);
  }

  @Patch(":id/read")
  markRead(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<Notification> {
    const currentUserId = req.user.id as string;
    return this.notificationsService.markRead(id, currentUserId);
  }
}

