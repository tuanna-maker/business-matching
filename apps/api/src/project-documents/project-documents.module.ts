import { Module } from "@nestjs/common";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { ProjectDocumentsController } from "./project-documents.controller";
import { ProjectDocumentsService } from "./project-documents.service";

@Module({
  controllers: [ProjectDocumentsController],
  providers: [ProjectDocumentsService, AuditLogInterceptor]
})
export class ProjectDocumentsModule {}

