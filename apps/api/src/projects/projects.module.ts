import { Module } from "@nestjs/common";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, AuditLogInterceptor]
})
export class ProjectsModule {}

