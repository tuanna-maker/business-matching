import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { UsersModule } from "../users/users.module";
import { ProfileService } from "./profile.service";

@Module({
  imports: [UsersModule],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}

