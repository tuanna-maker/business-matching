import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import type { ProjectDocument, ProjectDocumentType } from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { ProjectDocumentsService } from "./project-documents.service";

@Controller()
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class ProjectDocumentsController {
  constructor(
    private readonly projectDocumentsService: ProjectDocumentsService
  ) {}

  @Post("projects/:projectId/documents")
  createMetadata(
    @Param("projectId") projectId: string,
    @Body()
    body: {
      type: ProjectDocumentType;
      fileName: string;
      mimeType: string;
    },
    @Req() req: any
  ): Promise<ProjectDocument> {
    const currentUserId = req.user.id as string;
    return this.projectDocumentsService.createMetadata(
      projectId,
      body.type,
      body.fileName,
      body.mimeType,
      currentUserId
    );
  }

  @Get("projects/:projectId/documents")
  listForProject(
    @Param("projectId") projectId: string
  ): Promise<ProjectDocument[]> {
    return this.projectDocumentsService.findByProject(projectId);
  }

  @Get("documents/:id")
  getOne(
    @Param("id") id: string
  ): Promise<ProjectDocument | null> {
    return this.projectDocumentsService.findOne(id);
  }

  @Patch("documents/:id")
  update(
    @Param("id") id: string,
    @Body()
    body: Partial<Pick<ProjectDocument, "type" | "is_public">>,
    @Req() req: any
  ): Promise<ProjectDocument> {
    const currentUserId = req.user.id as string;
    return this.projectDocumentsService.update(id, body, currentUserId);
  }

  @Delete("documents/:id")
  remove(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<void> {
    const currentUserId = req.user.id as string;
    return this.projectDocumentsService.remove(id, currentUserId);
  }
}

