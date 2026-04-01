import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import type { DataRoom, DataRoomRequest, DataAccessTier, DataAccessGrant } from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { DataRoomService } from "./data-room.service";

@Controller()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class DataRoomController {
  constructor(private readonly dataRoomService: DataRoomService) {}

  @Get("data-room/requests/mine")
  listMyRequests(@Req() req: any) {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.listMyRequests(currentUserId);
  }

  @Post("projects/:projectId/data-room")
  @UseGuards(new RolesGuard(["startup"] as any))
  createOrUpdateDataRoom(
    @Param("projectId") projectId: string,
    @Body() body: { name: string; description?: string },
    @Req() req: any
  ): Promise<DataRoom> {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.upsertDataRoomForProject(projectId, body, currentUserId);
  }

  @Get("projects/:projectId/data-room")
  getDataRoomForProject(
    @Param("projectId") projectId: string,
    @Req() req: any
  ) {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.getDataRoomForProject(projectId, currentUserId);
  }

  // p0-2: requestTierAccess — nhận đủ tier + purpose + NDA, kiểm tra trust gating cho confidential
  @Post("data-room/:dataRoomId/requests")
  @UseGuards(new RolesGuard(["investor"] as any))
  requestAccess(
    @Param("dataRoomId") dataRoomId: string,
    @Body() body: { tier?: DataAccessTier; purpose: string; message?: string; nda_accepted?: boolean },
    @Req() req: any
  ): Promise<DataRoomRequest> {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.requestTierAccess(
      dataRoomId,
      body.tier ?? ("protected" as DataAccessTier),
      body.purpose ?? "",
      currentUserId
    );
  }

  // p0-1: respondToRequest — tạo DataAccessGrant khi approved, gửi notification
  @Patch("data-room/requests/:id")
  @UseGuards(new RolesGuard(["startup"] as any))
  respondToRequest(
    @Param("id") id: string,
    @Body() body: { status: "accepted" | "rejected"; reason?: string; ttl_days?: number },
    @Req() req: any
  ) {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.respondToRequest(
      id,
      body.status as any,
      body.reason,
      currentUserId,
      body.ttl_days
    );
  }

  // p0-1: revokeAccess — owner/admin thu hồi quyền truy cập bất kỳ lúc nào
  @Delete("data-room/grants/:id")
  @UseGuards(new RolesGuard(["startup"] as any))
  @HttpCode(HttpStatus.NO_CONTENT)
  revokeAccess(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<void> {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.revokeAccess(id, currentUserId);
  }

  // List access grants cho owner xem ai đang có quyền
  @Get("data-room/:dataRoomId/grants")
  listAccessGrants(
    @Param("dataRoomId") dataRoomId: string,
    @Req() req: any
  ): Promise<DataAccessGrant[]> {
    const currentUserId = req.user.id as string;
    return this.dataRoomService.listAccessGrants(dataRoomId, currentUserId);
  }
}
