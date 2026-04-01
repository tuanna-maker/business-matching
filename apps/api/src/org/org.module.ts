import { Module } from "@nestjs/common";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { OrgController } from "./org.controller";
import { OrgService } from "./org.service";

@Module({
  controllers: [OrgController],
  providers: [OrgService, AuditLogInterceptor]
})
export class OrgModule {}

