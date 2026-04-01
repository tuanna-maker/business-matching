import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { DataRoomService } from "./data-room.service";
import { DataRoomController } from "./data-room.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [DataRoomController],
  providers: [DataRoomService, AuditLogInterceptor]
})
export class DataRoomModule {}

