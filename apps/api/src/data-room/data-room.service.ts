import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type {
  DataRoom,
  DataRoomRequest,
  DataRoomRequestStatus,
  DataAccessTier,
  DataRoomDocument,
  DataAccessGrant,
  DataRoomWithDocuments
} from "@iec-hub/shared";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { WebhookService } from "../notifications/webhook.service";
import { randomUUID } from "crypto";

/**
 * 3-Tier Data Access Control System (SRS Epic 3)
 * - PUBLIC: Visible to all verified users
 * - PROTECTED: Requires approval, default 30-day TTL
 * - CONFIDENTIAL: Requires NDA + Trust Score >= 60, default 14-day TTL
 */
@Injectable()
export class DataRoomService {
  private static PROTECTED_TTL_DAYS = 30;
  private static CONFIDENTIAL_TTL_DAYS = 14;
  private static MIN_TRUST_SCORE_FOR_CONFIDENTIAL = 60;

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly webhooks: WebhookService
  ) {}

  private mapDataRoom(db: any): DataRoom {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      project_id: db.project_id,
      name: db.title,
      description: db.description ?? null
    };
  }

  private mapRequest(db: any, projectId?: string, requesterId?: string): DataRoomRequest {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      project_id: projectId ?? (db.data_room?.project_id ?? null),
      investor_id: requesterId ?? db.requester_id,
      data_room_id: db.data_room_id ?? null,
      status: db.status as DataRoomRequestStatus,
      reason: db.response_note ?? null,
      requested_tier: db.requested_tier as DataAccessTier ?? null,
      purpose: db.purpose ?? null
    };
  }

  private mapDocument(db: any): DataRoomDocument {
    return {
      id: db.id,
      org_id: db.org_id ?? null,
      created_at: db.created_at.toISOString(),
      updated_at: db.updated_at.toISOString(),
      created_by: db.created_by ?? null,
      data_room_id: db.data_room_id,
      title: db.title,
      type: db.type,
      storage_path: db.storage_path,
      file_size: db.file_size ?? null,
      mime_type: db.mime_type ?? null,
      tier: db.tier as DataAccessTier
    };
  }

  private mapGrant(db: any): DataAccessGrant {
    return {
      id: db.id,
      data_room_id: db.data_room_id,
      user_id: db.user_id,
      tier: db.tier as DataAccessTier,
      granted_at: db.granted_at.toISOString(),
      expires_at: db.expires_at.toISOString(),
      revoked_at: db.revoked_at?.toISOString() ?? null,
      nda_signed: db.nda_signed ?? false
    };
  }

  // ============= Access Control Methods =============

  async getUserAccessTier(
    dataRoomId: string,
    userId: string
  ): Promise<{ tier: DataAccessTier | null; grant: DataAccessGrant | null }> {
    const grant = await this.prisma.dataAccessGrant.findFirst({
      where: {
        data_room_id: dataRoomId,
        user_id: userId,
        revoked_at: null,
        expires_at: { gt: new Date() }
      },
      orderBy: { tier: "desc" }
    });

    if (grant) {
      return { tier: grant.tier as DataAccessTier, grant: this.mapGrant(grant) };
    }
    return { tier: "public" as DataAccessTier, grant: null };
  }

  async isDataRoomOwner(dataRoomId: string, userId: string): Promise<boolean> {
    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: { id: dataRoomId },
      include: { project: true }
    });
    if (!dataRoom) return false;

    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: userId }
    });
    return startup?.id === dataRoom.project?.startup_id;
  }

  async getDataRoomWithDocuments(
    projectId: string,
    currentUserId: string
  ): Promise<DataRoomWithDocuments | null> {
    const dataRoom = await this.prisma.dataRoom.findFirst({
      where: { project_id: projectId },
      include: { data_room_documents: { orderBy: { created_at: "desc" } } }
    });
    if (!dataRoom) return null;

    const isOwner = await this.isDataRoomOwner(dataRoom.id, currentUserId);
    
    if (isOwner) {
      return {
        ...this.mapDataRoom(dataRoom),
        documents: dataRoom.data_room_documents.map((d: any) => this.mapDocument(d)),
        my_access_tier: "confidential" as DataAccessTier,
        my_grant_expires_at: null
      };
    }

    const { tier, grant } = await this.getUserAccessTier(dataRoom.id, currentUserId);

    const accessibleTiers: string[] = ["public"];
    if (tier === "protected" || tier === "confidential") accessibleTiers.push("protected");
    if (tier === "confidential") accessibleTiers.push("confidential");

    const filteredDocs = dataRoom.data_room_documents
      .filter((d: any) => accessibleTiers.includes(d.tier))
      .map((d: any) => this.mapDocument(d));

    return {
      ...this.mapDataRoom(dataRoom),
      documents: filteredDocs,
      my_access_tier: tier,
      my_grant_expires_at: grant?.expires_at ?? null
    };
  }

  async uploadDocument(
    dataRoomId: string,
    dto: {
      title: string;
      type: string;
      storage_path: string;
      file_size?: number;
      mime_type?: string;
      tier: DataAccessTier;
    },
    currentUserId: string
  ): Promise<DataRoomDocument> {
    const isOwner = await this.isDataRoomOwner(dataRoomId, currentUserId);
    if (!isOwner) throw new ForbiddenException("Only the project owner can upload documents");

    const dataRoom = await this.prisma.dataRoom.findUnique({ where: { id: dataRoomId } });
    if (!dataRoom) throw new NotFoundException("Data room not found");

    const doc = await this.prisma.dataRoomDocument.create({
      data: {
        id: randomUUID(),
        org_id: dataRoom.org_id,
        data_room_id: dataRoomId,
        title: dto.title,
        type: dto.type,
        storage_path: dto.storage_path,
        file_size: dto.file_size ?? null,
        mime_type: dto.mime_type ?? null,
        tier: dto.tier,
        created_by: currentUserId
      }
    });

    return this.mapDocument(doc);
  }

  async requestTierAccess(
    dataRoomId: string,
    requestedTier: DataAccessTier,
    purpose: string,
    currentUserId: string
  ): Promise<DataRoomRequest> {
    if (requestedTier === "public") {
      throw new ForbiddenException("Public tier does not require access request");
    }

    const investor = await this.prisma.investorProfile.findUnique({
      where: { user_id: currentUserId },
      include: { user: true }
    });
    if (!investor) throw new ForbiddenException("Current user is not an investor");

    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: { id: dataRoomId },
      include: { project: { include: { startup_profile: { include: { user: true } } } } }
    });
    if (!dataRoom) throw new NotFoundException("Data room not found");

    if (requestedTier === "confidential") {
      const trustScore = await this.prisma.trustScore.findFirst({
        where: { org_id: investor.org_id ?? undefined },
        orderBy: { last_calculated: "desc" }
      });

      if (!trustScore || trustScore.score < DataRoomService.MIN_TRUST_SCORE_FOR_CONFIDENTIAL) {
        throw new ForbiddenException(
          `Trust Score >= ${DataRoomService.MIN_TRUST_SCORE_FOR_CONFIDENTIAL} required for confidential access`
        );
      }
    }

    const existingPending = await this.prisma.dataRoomRequest.findFirst({
      where: { data_room_id: dataRoomId, requester_id: currentUserId, status: "pending" }
    });
    if (existingPending) throw new ForbiddenException("You already have a pending request");

    const created = await this.prisma.dataRoomRequest.create({
      data: {
        id: randomUUID(),
        org_id: investor.org_id,
        data_room_id: dataRoomId,
        requester_id: currentUserId,
        requested_tier: requestedTier,
        purpose,
        status: "pending",
        created_by: currentUserId
      }
    });

    const startupUserId = dataRoom.project?.startup_profile?.user_id;
    if (startupUserId) {
      await this.notifications.createForUser(
        startupUserId,
        "data_room_request_created",
        { request_id: created.id, project_id: dataRoom.project_id, requested_tier: requestedTier },
        dataRoom.org_id
      );
    }

    // Emit webhook event for external integrations
    if (dataRoom.org_id) {
      this.webhooks.deliverEvent(dataRoom.org_id, "dataroom_request", {
        request_id: created.id,
        data_room_id: dataRoomId,
        project_id: dataRoom.project_id,
        requester_id: currentUserId,
        requester_name: investor.user?.full_name,
        requested_tier: requestedTier,
        purpose
      });
    }

    return this.mapRequest(created, dataRoom.project_id, currentUserId);
  }

  async respondToRequest(
    requestId: string,
    status: DataRoomRequestStatus,
    reason: string | undefined,
    currentUserId: string,
    customTtlDays?: number
  ): Promise<{ request: DataRoomRequest; grant?: DataAccessGrant }> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) throw new ForbiddenException("Current user is not a startup owner");

    const request = await this.prisma.dataRoomRequest.findUnique({
      where: { id: requestId },
      include: { data_room: { include: { project: true } }, user: true }
    });
    if (!request) throw new NotFoundException("Request not found");

    const project = request.data_room?.project;
    if (!project || project.startup_id !== startup.id) {
      throw new ForbiddenException("You cannot respond to this request");
    }

    const updated = await this.prisma.dataRoomRequest.update({
      where: { id: requestId },
      data: { status, response_note: reason, responded_at: new Date() }
    });

    let grant: DataAccessGrant | undefined;

    if (status === "accepted" && request.requested_tier) {
      const ttlDays = customTtlDays ?? (
        request.requested_tier === "confidential"
          ? DataRoomService.CONFIDENTIAL_TTL_DAYS
          : DataRoomService.PROTECTED_TTL_DAYS
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ttlDays);

      const grantData = await this.prisma.dataAccessGrant.upsert({
        where: {
          data_room_id_user_id_tier: {
            data_room_id: request.data_room_id,
            user_id: request.requester_id,
            tier: request.requested_tier
          }
        },
        update: { expires_at: expiresAt, revoked_at: null, granted_at: new Date() },
        create: {
          id: randomUUID(),
          org_id: request.org_id,
          data_room_id: request.data_room_id,
          user_id: request.requester_id,
          tier: request.requested_tier,
          expires_at: expiresAt,
          nda_signed: request.requested_tier === "confidential"
        }
      });

      grant = this.mapGrant(grantData);
    }

    await this.notifications.createForUser(
      request.requester_id,
      "data_room_request_updated",
      { request_id: updated.id, project_id: request.data_room?.project_id, status: updated.status },
      request.org_id
    );

    // Emit webhook events for external integrations
    if (request.org_id) {
      if (status === "accepted") {
        this.webhooks.deliverEvent(request.org_id, "dataroom_access_granted", {
          request_id: updated.id,
          data_room_id: request.data_room_id,
          project_id: request.data_room?.project_id,
          user_id: request.requester_id,
          tier: request.requested_tier,
          expires_at: grant?.expires_at
        });
      }
    }

    return { request: this.mapRequest(updated as any, request.data_room?.project_id), grant };
  }

  async revokeAccess(grantId: string, currentUserId: string): Promise<void> {
    const grant = await this.prisma.dataAccessGrant.findUnique({
      where: { id: grantId },
      include: { data_room: { include: { project: true } } }
    });
    if (!grant) throw new NotFoundException("Access grant not found");

    const isOwner = await this.isDataRoomOwner(grant.data_room_id, currentUserId);
    if (!isOwner) throw new ForbiddenException("Only the project owner can revoke access");

    await this.prisma.dataAccessGrant.update({
      where: { id: grantId },
      data: { revoked_at: new Date() }
    });

    await this.notifications.createForUser(
      grant.user_id,
      "data_access_revoked",
      { project_id: grant.data_room?.project_id, tier: grant.tier },
      grant.org_id
    );

    // Emit webhook event for external integrations
    if (grant.org_id) {
      this.webhooks.deliverEvent(grant.org_id, "dataroom_access_revoked", {
        grant_id: grantId,
        data_room_id: grant.data_room_id,
        project_id: grant.data_room?.project_id,
        user_id: grant.user_id,
        tier: grant.tier
      });
    }
  }

  async listAccessGrants(dataRoomId: string, currentUserId: string): Promise<DataAccessGrant[]> {
    const isOwner = await this.isDataRoomOwner(dataRoomId, currentUserId);
    if (!isOwner) throw new ForbiddenException("Only the project owner can view access grants");

    const grants = await this.prisma.dataAccessGrant.findMany({
      where: { data_room_id: dataRoomId },
      orderBy: { granted_at: "desc" }
    });

    return grants.map((g: any) => this.mapGrant(g));
  }

  // ============= Existing Methods =============

  async listMyRequests(currentUserId: string): Promise<{
    asStartup: Array<{
      request: DataRoomRequest;
      project: { id: string; title: string; slug: string; iec_level: string | null };
      investor: { id: string; organization_name: string; user: { full_name: string; email: string } };
    }>;
    asInvestor: Array<{
      request: DataRoomRequest;
      project: { id: string; title: string; slug: string; iec_level: string | null };
      startup: { id: string; company_name: string; user: { full_name: string; email: string } };
    }>;
  }> {
    const [startup, investor] = await Promise.all([
      this.prisma.startupProfile.findUnique({ where: { user_id: currentUserId } }),
      this.prisma.investorProfile.findUnique({ where: { user_id: currentUserId } })
    ]);

    const asStartup = startup
      ? await this.prisma.dataRoomRequest.findMany({
          where: {
            data_room: {
              project: {
                startup_id: startup.id
              }
            }
          },
          include: {
            data_room: {
              include: {
                project: {
                  select: {
                    id: true, title: true, iec_level: true,
                    status: true, industry: true, stage: true,
                    funding_need_amount: true, funding_currency: true,
                    hero_image_url: true, org_id: true, startup_id: true,
                    created_at: true, updated_at: true
                  }
                }
              }
            },
            user: {
              include: {
                investor_profile: true
              }
            }
          },
          orderBy: { created_at: "desc" },
          take: 200
        })
      : [];

    const asInvestor = investor
      ? await this.prisma.dataRoomRequest.findMany({
          where: { requester_id: currentUserId },
          include: {
            data_room: {
              include: {
                project: {
                  select: {
                    id: true, title: true, iec_level: true,
                    status: true, industry: true, stage: true,
                    funding_need_amount: true, funding_currency: true,
                    hero_image_url: true, org_id: true, startup_id: true,
                    created_at: true, updated_at: true,
                    startup_profile: {
                      select: {
                        id: true, company_name: true,
                        user: { select: { id: true, full_name: true, email: true } }
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { created_at: "desc" },
          take: 200
        })
      : [];

    return {
      asStartup: asStartup.map((r: any) => ({
        request: this.mapRequest(r, r.data_room?.project_id, r.requester_id),
        project: {
          id: r.data_room.project.id,
          title: r.data_room.project.title,
          slug: r.data_room.project.id,
          iec_level: r.data_room.project.iec_level ?? null
        },
        investor: {
          id: r.user.investor_profile?.id ?? r.requester_id,
          organization_name: r.user.investor_profile?.company_name ?? r.user.full_name,
          user: {
            full_name: r.user.full_name,
            email: r.user.email
          }
        }
      })),
      asInvestor: asInvestor.map((r: any) => ({
        request: this.mapRequest(r, r.data_room?.project_id, r.requester_id),
        project: {
          id: r.data_room.project.id,
          title: r.data_room.project.title,
          slug: r.data_room.project.id,
          iec_level: r.data_room.project.iec_level ?? null
        },
        startup: {
          id: r.data_room.project.startup_profile.id,
          company_name: r.data_room.project.startup_profile.company_name,
          user: {
            full_name: r.data_room.project.startup_profile.user.full_name,
            email: r.data_room.project.startup_profile.user.email
          }
        }
      }))
    };
  }

  async upsertDataRoomForProject(
    projectId: string,
    dto: { name: string; description?: string },
    currentUserId: string
  ): Promise<DataRoom> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) {
      throw new ForbiddenException("Current user is not a startup owner");
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || project.startup_id !== startup.id) {
      throw new ForbiddenException("You cannot manage data room for this project");
    }

    const existing = await this.prisma.dataRoom.findFirst({
      where: { project_id: projectId }
    });

    const saved = existing
      ? await this.prisma.dataRoom.update({
          where: { id: existing.id },
          data: {
            title: dto.name,
            description: dto.description ?? existing.description
          }
        })
      : await this.prisma.dataRoom.create({
          data: {
            id: randomUUID(),
            org_id: project.org_id,
            project_id: projectId,
            title: dto.name,
            description: dto.description ?? null,
            created_by: currentUserId
          }
        });

    return this.mapDataRoom(saved);
  }

  async getDataRoomForProject(
    projectId: string,
    currentUserId: string
  ): Promise<{
    dataRoom: DataRoom | null;
    requestsForStartup: DataRoomRequest[];
    myRequest: DataRoomRequest | null;
  }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true, org_id: true, startup_id: true, title: true,
        status: true, iec_level: true, created_by: true
      }
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const [startupProfile, investor_profile] = await Promise.all([
      this.prisma.startupProfile.findUnique({
        where: { user_id: currentUserId }
      }),
      this.prisma.investorProfile.findUnique({
        where: { user_id: currentUserId }
      })
    ]);

    const dataRoom = await this.prisma.dataRoom.findFirst({
      where: { project_id: projectId }
    });

    let requestsForStartup: DataRoomRequest[] = [];
    let myRequest: DataRoomRequest | null = null;

    if (startupProfile && project.startup_id === startupProfile.id && dataRoom) {
      const items = await this.prisma.dataRoomRequest.findMany({
        where: { data_room_id: dataRoom.id },
        include: { data_room: true },
        orderBy: { created_at: "desc" }
      });
      requestsForStartup = items.map((r: any) => this.mapRequest(r, r.data_room?.project_id));
    }

    if (investor_profile && dataRoom) {
      const req = await this.prisma.dataRoomRequest.findFirst({
        where: {
          data_room_id: dataRoom.id,
          requester_id: currentUserId
        },
        include: { data_room: true },
        orderBy: { created_at: "desc" }
      });
      if (req) {
        myRequest = this.mapRequest(req as any, (req as any).data_room?.project_id);
      }
    }

    return {
      dataRoom: dataRoom ? this.mapDataRoom(dataRoom) : null,
      requestsForStartup,
      myRequest
    };
  }

  async createRequest(
    dataRoomId: string,
    currentUserId: string
  ): Promise<DataRoomRequest> {
    const investor = await this.prisma.investorProfile.findUnique({
      where: { user_id: currentUserId },
      include: {
        user: true
      }
    });
    if (!investor) {
      throw new ForbiddenException("Current user is not an investor");
    }

    const dataRoom = await this.prisma.dataRoom.findUnique({
      where: { id: dataRoomId }
    });
    if (!dataRoom) {
      throw new NotFoundException("Data room not found");
    }

    const project = await this.prisma.project.findUnique({
      where: { id: dataRoom.project_id },
      include: {
        startup_profile: {
          include: {
            user: true
          }
        }
      }
    });
    if (!project) {
      throw new ForbiddenException("Project not found");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRejected = await this.prisma.dataRoomRequest.findFirst({
      where: {
        data_room_id: dataRoomId,
        requester_id: currentUserId,
        status: "rejected",
        created_at: {
          gte: thirtyDaysAgo
        }
      }
    });

    if (recentRejected) {
      throw new ForbiddenException(
        "Your previous data room request was rejected less than 30 days ago"
      );
    }

    const created = await this.prisma.dataRoomRequest.create({
      data: {
        id: randomUUID(),
        org_id: investor.org_id,
        data_room_id: dataRoomId,
        requester_id: currentUserId,
        status: "pending",
        created_by: currentUserId
      }
    });

    const mapped = this.mapRequest(created, dataRoom.project_id, currentUserId);

    const startupUserId = project.startup_profile?.user_id;
    if (startupUserId) {
      await this.notifications.createForUser(
        startupUserId,
        "data_room_request_created",
        {
          request_id: mapped.id,
          project_id: mapped.project_id,
          investor_id: mapped.investor_id
        },
        project.org_id
      );
    }

    return mapped;
  }

  async updateRequestStatus(
    requestId: string,
    status: DataRoomRequestStatus,
    reason: string | undefined,
    currentUserId: string
  ): Promise<DataRoomRequest> {
    const startup = await this.prisma.startupProfile.findUnique({
      where: { user_id: currentUserId }
    });
    if (!startup) {
      throw new ForbiddenException("Current user is not a startup owner");
    }

    const existing = await this.prisma.dataRoomRequest.findUnique({
      where: { id: requestId },
      include: {
        data_room: {
          include: {
            project: true
          }
        }
      }
    });
    if (!existing) {
      throw new NotFoundException("Request not found");
    }

    const project = existing.data_room?.project;
    if (!project || project.startup_id !== startup.id) {
      throw new ForbiddenException("You cannot update this request");
    }

    const updated = await this.prisma.dataRoomRequest.update({
      where: { id: requestId },
      data: {
        status,
        response_note: reason ?? existing.response_note,
        responded_at: new Date()
      },
      include: { data_room: true }
    });

    const mapped = this.mapRequest(updated as any, (updated as any).data_room?.project_id);

    const requesterUser = await this.prisma.user.findUnique({
      where: { id: existing.requester_id }
    });
    if (requesterUser) {
      await this.notifications.createForUser(
        requesterUser.id,
        "data_room_request_updated",
        {
          request_id: mapped.id,
          project_id: mapped.project_id,
          status: mapped.status
        },
        existing.org_id
      );
    }

    return mapped;
  }
}
