import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Query
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import {
  WebhookService,
  WebhookDto,
  WebhookDeliveryDto,
  CreateWebhookDto,
  UpdateWebhookDto
} from "./webhook.service";

@Controller("webhooks")
@UseGuards(JwtAuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * List available event types
   */
  @Get("event-types")
  getEventTypes(): { events: string[] } {
    return { events: this.webhookService.getEventTypes() };
  }

  /**
   * List all webhooks for the user's organization
   */
  @Get()
  async listWebhooks(@Req() req: any): Promise<WebhookDto[]> {
    const orgId = req.user.org_id as string;
    if (!orgId) {
      return [];
    }
    return this.webhookService.listWebhooks(orgId);
  }

  /**
   * Get a specific webhook
   */
  @Get(":id")
  async getWebhook(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<WebhookDto> {
    const orgId = req.user.org_id as string;
    return this.webhookService.getWebhook(id, orgId);
  }

  /**
   * Create a new webhook
   */
  @Post()
  async createWebhook(
    @Body() dto: CreateWebhookDto,
    @Req() req: any
  ): Promise<WebhookDto> {
    const orgId = req.user.org_id as string;
    const userId = req.user.id as string;
    return this.webhookService.createWebhook(dto, orgId, userId);
  }

  /**
   * Update a webhook
   */
  @Patch(":id")
  async updateWebhook(
    @Param("id") id: string,
    @Body() dto: UpdateWebhookDto,
    @Req() req: any
  ): Promise<WebhookDto> {
    const orgId = req.user.org_id as string;
    return this.webhookService.updateWebhook(id, dto, orgId);
  }

  /**
   * Delete a webhook
   */
  @Delete(":id")
  async deleteWebhook(
    @Param("id") id: string,
    @Req() req: any
  ): Promise<{ success: boolean }> {
    const orgId = req.user.org_id as string;
    await this.webhookService.deleteWebhook(id, orgId);
    return { success: true };
  }

  /**
   * Get delivery history for a webhook
   */
  @Get(":id/deliveries")
  async getDeliveries(
    @Param("id") id: string,
    @Query("limit") limit: string | undefined,
    @Req() req: any
  ): Promise<WebhookDeliveryDto[]> {
    const orgId = req.user.org_id as string;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.webhookService.getDeliveries(id, orgId, limitNum);
  }
}
