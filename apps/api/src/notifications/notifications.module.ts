import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationsService } from "./notifications.service";
import { NotificationsGateway } from "./notifications.gateway";
import { NotificationsController } from "./notifications.controller";
import { WebhookService } from "./webhook.service";
import { WebhookController } from "./webhook.controller";

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  providers: [NotificationsService, NotificationsGateway, WebhookService],
  controllers: [NotificationsController, WebhookController],
  exports: [NotificationsService, NotificationsGateway, WebhookService]
})
export class NotificationsModule {}

