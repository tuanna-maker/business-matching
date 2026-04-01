import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { ServicesService } from "./services.service";

@Controller("services")
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Get()
  list(
    @Query("search") search?: string,
    @Query("industry") industry?: string,
    @Query("category") category?: string
  ) {
    return this.services.listPublished({ search, industry, category });
  }

  @Post()
  @UseGuards(new RolesGuard(["startup"] as any))
  create(@Req() req: any, @Body() body: any) {
    const currentUserId = req.user.id as string;
    return this.services.createForStartup(currentUserId, body);
  }
}

