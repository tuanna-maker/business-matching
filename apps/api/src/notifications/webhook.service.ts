import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID, createHmac } from "crypto";

export interface WebhookDto {
  id: string;
  org_id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDeliveryDto {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  response_status: number | null;
  status: string;
  attempts: number;
  delivered_at: string | null;
  created_at: string;
}

export interface CreateWebhookDto {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookDto {
  name?: string;
  url?: string;
  events?: string[];
  secret?: string;
  is_active?: boolean;
}

/**
 * Supported webhook event types:
 * - dataroom_request: When someone requests access to a data room
 * - dataroom_access_granted: When data room access is granted
 * - dataroom_access_revoked: When data room access is revoked
 * - iec_level_updated: When a project's IEC level changes
 * - iec_assessment_created: When an IEC assessment is requested
 * - match_created: When a new match is created
 * - match_stage_changed: When a match pipeline stage changes
 * - match_deal_closed: When a match deal is closed (won/lost)
 */
export const WEBHOOK_EVENT_TYPES = [
  "dataroom_request",
  "dataroom_access_granted",
  "dataroom_access_revoked",
  "iec_level_updated",
  "iec_assessment_created",
  "match_created",
  "match_stage_changed",
  "match_deal_closed"
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  private mapWebhook(db: any): WebhookDto {
    return {
      id: db.id,
      org_id: db.org_id,
      name: db.name,
      url: db.url,
      events: db.events,
      is_active: db.is_active,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString()
    };
  }

  private mapDelivery(db: any): WebhookDeliveryDto {
    return {
      id: db.id,
      webhook_id: db.webhook_id,
      event_type: db.event_type,
      payload: db.payload,
      response_status: db.response_status,
      status: db.status,
      attempts: db.attempts,
      delivered_at: db.delivered_at?.toISOString() ?? null,
      created_at: db.created_at.toISOString()
    };
  }

  /**
   * List all webhooks for an organization
   */
  async listWebhooks(orgId: string): Promise<WebhookDto[]> {
    const webhooks = await this.prisma.webhook.findMany({
      where: { org_id: orgId },
      orderBy: { created_at: "desc" }
    });
    return webhooks.map((w) => this.mapWebhook(w));
  }

  /**
   * Get a webhook by ID
   */
  async getWebhook(id: string, orgId: string): Promise<WebhookDto> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id }
    });
    if (!webhook) {
      throw new NotFoundException("Webhook not found");
    }
    if (webhook.org_id !== orgId) {
      throw new ForbiddenException("Access denied to this webhook");
    }
    return this.mapWebhook(webhook);
  }

  /**
   * Create a new webhook
   */
  async createWebhook(
    dto: CreateWebhookDto,
    orgId: string,
    userId: string
  ): Promise<WebhookDto> {
    // Validate URL
    try {
      new URL(dto.url);
    } catch {
      throw new ForbiddenException("Invalid webhook URL");
    }

    // Validate events
    for (const event of dto.events) {
      if (!WEBHOOK_EVENT_TYPES.includes(event as WebhookEventType)) {
        throw new ForbiddenException(`Invalid event type: ${event}`);
      }
    }

    const created = await this.prisma.webhook.create({
      data: {
        id: randomUUID(),
        org_id: orgId,
        name: dto.name,
        url: dto.url,
        secret: dto.secret ?? null,
        events: dto.events,
        is_active: true,
        created_by: userId
      }
    });

    return this.mapWebhook(created);
  }

  /**
   * Update a webhook
   */
  async updateWebhook(
    id: string,
    dto: UpdateWebhookDto,
    orgId: string
  ): Promise<WebhookDto> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id }
    });
    if (!webhook) {
      throw new NotFoundException("Webhook not found");
    }
    if (webhook.org_id !== orgId) {
      throw new ForbiddenException("Access denied to this webhook");
    }

    if (dto.url) {
      try {
        new URL(dto.url);
      } catch {
        throw new ForbiddenException("Invalid webhook URL");
      }
    }

    if (dto.events) {
      for (const event of dto.events) {
        if (!WEBHOOK_EVENT_TYPES.includes(event as WebhookEventType)) {
          throw new ForbiddenException(`Invalid event type: ${event}`);
        }
      }
    }

    const updated = await this.prisma.webhook.update({
      where: { id },
      data: {
        name: dto.name,
        url: dto.url,
        secret: dto.secret,
        events: dto.events,
        is_active: dto.is_active
      }
    });

    return this.mapWebhook(updated);
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string, orgId: string): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id }
    });
    if (!webhook) {
      throw new NotFoundException("Webhook not found");
    }
    if (webhook.org_id !== orgId) {
      throw new ForbiddenException("Access denied to this webhook");
    }

    await this.prisma.webhookDelivery.deleteMany({
      where: { webhook_id: id }
    });

    await this.prisma.webhook.delete({
      where: { id }
    });
  }

  /**
   * Deliver webhook events to all registered webhooks for an organization
   */
  async deliverEvent(
    orgId: string,
    eventType: WebhookEventType,
    payload: any
  ): Promise<void> {
    const webhooks = await this.prisma.webhook.findMany({
      where: {
        org_id: orgId,
        is_active: true,
        events: { has: eventType }
      }
    });

    for (const webhook of webhooks) {
      // Create delivery record
      const delivery = await this.prisma.webhookDelivery.create({
        data: {
          id: randomUUID(),
          webhook_id: webhook.id,
          event_type: eventType,
          payload,
          status: "pending"
        }
      });

      // Send async - don't block the main flow
      this.sendWebhook(webhook, delivery.id, eventType, payload).catch(
        (err) => {
          console.error(
            `Webhook delivery failed for ${webhook.id}:`,
            err.message
          );
        }
      );
    }
  }

  /**
   * Send webhook with retry logic
   */
  private async sendWebhook(
    webhook: { id: string; url: string; secret: string | null },
    deliveryId: string,
    eventType: string,
    payload: any
  ): Promise<void> {
    const body = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Webhook-Event": eventType,
      "X-Webhook-Delivery-Id": deliveryId
    };

    // Add HMAC signature if secret is configured
    if (webhook.secret) {
      const signature = createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");
      headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseBody = await response.text().catch(() => "");

      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          response_status: response.status,
          response_body: responseBody.slice(0, 1000), // Limit stored response
          status: response.ok ? "success" : "failed",
          delivered_at: new Date()
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      await this.prisma.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          response_body: errorMessage,
          status: "failed"
        }
      });

      // Simple retry logic - retry once after 5 seconds
      const delivery = await this.prisma.webhookDelivery.findUnique({
        where: { id: deliveryId }
      });
      if (delivery && delivery.attempts < 3) {
        await this.prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: { attempts: delivery.attempts + 1, status: "pending" }
        });

        setTimeout(() => {
          this.sendWebhook(webhook, deliveryId, eventType, payload).catch(
            () => {}
          );
        }, 5000 * delivery.attempts);
      }
    }
  }

  /**
   * Get delivery history for a webhook
   */
  async getDeliveries(
    webhookId: string,
    orgId: string,
    limit: number = 50
  ): Promise<WebhookDeliveryDto[]> {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId }
    });
    if (!webhook) {
      throw new NotFoundException("Webhook not found");
    }
    if (webhook.org_id !== orgId) {
      throw new ForbiddenException("Access denied to this webhook");
    }

    const deliveries = await this.prisma.webhookDelivery.findMany({
      where: { webhook_id: webhookId },
      orderBy: { created_at: "desc" },
      take: limit
    });

    return deliveries.map((d) => this.mapDelivery(d));
  }

  /**
   * List available event types
   */
  getEventTypes(): string[] {
    return [...WEBHOOK_EVENT_TYPES];
  }
}
