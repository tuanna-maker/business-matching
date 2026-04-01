import { Module } from "@nestjs/common";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { MatchScoreService } from "./match-score.service";

@Module({
  imports: [NotificationsModule],
  controllers: [MatchingController],
  providers: [MatchingService, AuditLogInterceptor, MatchScoreService],
  exports: [MatchScoreService]
})
export class MatchingModule {}

