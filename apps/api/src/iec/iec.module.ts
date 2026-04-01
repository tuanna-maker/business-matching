import { Module } from "@nestjs/common";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { IecController } from "./iec.controller";
import { IecService } from "./iec.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { TrustScoreService } from "./trust-score.service";
import { VouchService } from "./vouch.service";

@Module({
  imports: [NotificationsModule],
  controllers: [IecController],
  providers: [IecService, AuditLogInterceptor, TrustScoreService, VouchService],
  exports: [TrustScoreService, VouchService]
})
export class IecModule {}

