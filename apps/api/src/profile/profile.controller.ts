import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import type { MeResponse, User } from "@iec-hub/shared";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { ProfileService } from "./profile.service";

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getMe(@Req() req: any): Promise<MeResponse> {
    const user = req.user as { id: string };
    return this.profileService.getMe(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  updateMe(
    @Req() req: any,
    @Body() payload: Partial<Pick<User, "full_name" | "phone" | "avatar_url">>
  ): Promise<MeResponse> {
    const user = req.user as { id: string };
    return this.profileService.updateMe(user.id, payload);
  }
}

