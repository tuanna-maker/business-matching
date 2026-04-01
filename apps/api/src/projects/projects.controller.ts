import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import type {
  Project,
  ProjectCreateDto,
  ProjectUpdateDto,
  UserType
} from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuditLogInterceptor } from "../common/interceptors/audit-log.interceptor";
import { ProjectsService } from "./projects.service";

@Controller("projects")
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  // Only startup users can create projects
  @UseGuards(new RolesGuard(["startup"] as unknown as UserType[]))
  create(
    @Body() dto: ProjectCreateDto,
    @Req() req: any
  ): Promise<Project> {
    const currentUserId = req.user.id as string;
    return this.projectsService.create(dto, currentUserId);
  }

  @Get()
  findAll(
    @Query("owner") owner?: string,
    @Req() req?: any
  ): Promise<Project[]> {
    const currentUserId = req?.user?.id as string;

    if (owner === "me") {
      return this.projectsService.findAllForStartup(currentUserId);
    }
    // Marketplace / discover: all published projects (never scope to viewer org)
    return this.projectsService.findAllPublished(null);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string
  ): Promise<Project | null> {
    return this.projectsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: ProjectUpdateDto,
    @Req() req: any
  ): Promise<Project> {
    const currentUserId = req.user.id as string;
    return this.projectsService.update(id, dto, currentUserId);
  }

  @Patch(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() body: { status: Project["status"] },
    @Req() req: any
  ): Promise<Project> {
    const currentUserId = req.user.id as string;
    return this.projectsService.updateStatus(id, body.status, currentUserId);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<void> {
    const currentUserId = req.user.id as string;
    return this.projectsService.remove(id, currentUserId);
  }
}

