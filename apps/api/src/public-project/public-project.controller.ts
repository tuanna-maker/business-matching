import { Controller, Get, Param } from "@nestjs/common";
import type { Project } from "@iec-hub/shared";
import { PublicProjectService } from "./public-project.service";

@Controller("public/projects")
export class PublicProjectController {
  constructor(private readonly publicProjectService: PublicProjectService) {}

  @Get(":slug")
  getBySlug(
    @Param("slug") slug: string
  ): Promise<Project> {
    return this.publicProjectService.getBySlug(slug);
  }
}

