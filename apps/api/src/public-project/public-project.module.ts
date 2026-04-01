import { Module } from "@nestjs/common";
import { PublicProjectController } from "./public-project.controller";
import { PublicProjectService } from "./public-project.service";

@Module({
  controllers: [PublicProjectController],
  providers: [PublicProjectService]
})
export class PublicProjectModule {}

