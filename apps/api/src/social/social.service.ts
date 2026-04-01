import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { randomUUID } from "crypto";

export interface FollowDto {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface ShareDto {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  platform: string;
  created_at: string;
}

export interface ActivityFeedItemDto {
  id: string;
  org_id: string;
  actor_id: string | null;
  activity_type: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  description: string | null;
  metadata: any;
  is_public: boolean;
  created_at: string;
  actor?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  org?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export const ACTIVITY_TYPES = [
  "project_created",
  "project_updated",
  "iec_level_updated",
  "milestone_reached",
  "funding_received",
  "team_joined",
  "partnership_announced",
  "award_received",
  "match_accepted",
  "data_room_opened",
  "custom"
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const SHARE_PLATFORMS = [
  "linkedin",
  "twitter",
  "facebook",
  "email",
  "copy_link"
] as const;

export type SharePlatform = (typeof SHARE_PLATFORMS)[number];

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService
  ) {}

  // ============================================
  // Follow Management
  // ============================================

  /**
   * Follow an organization
   */
  async followOrg(userId: string, orgId: string): Promise<FollowDto> {
    const org = await this.prisma.org.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException("Organization not found");
    }

    // Check if user's own org
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.org_id === orgId) {
      throw new ForbiddenException("Cannot follow your own organization");
    }

    // Check if already following
    const existing = await this.prisma.orgFollow.findUnique({
      where: {
        follower_id_followed_id: { follower_id: userId, followed_id: orgId }
      }
    });
    if (existing) {
      throw new BadRequestException("Already following this organization");
    }

    const follow = await this.prisma.orgFollow.create({
      data: {
        id: randomUUID(),
        follower_id: userId,
        followed_id: orgId
      }
    });

    return {
      id: follow.id,
      follower_id: follow.follower_id,
      followed_id: follow.followed_id,
      created_at: follow.created_at.toISOString()
    };
  }

  /**
   * Unfollow an organization
   */
  async unfollowOrg(userId: string, orgId: string): Promise<void> {
    const follow = await this.prisma.orgFollow.findUnique({
      where: {
        follower_id_followed_id: { follower_id: userId, followed_id: orgId }
      }
    });

    if (!follow) {
      throw new NotFoundException("Not following this organization");
    }

    await this.prisma.orgFollow.delete({
      where: { id: follow.id }
    });
  }

  /**
   * Check if user follows an organization
   */
  async isFollowing(userId: string, orgId: string): Promise<boolean> {
    const follow = await this.prisma.orgFollow.findUnique({
      where: {
        follower_id_followed_id: { follower_id: userId, followed_id: orgId }
      }
    });
    return !!follow;
  }

  /**
   * Get followers of an organization
   */
  async getFollowers(
    orgId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ followers: any[]; total: number }> {
    const [followers, total] = await Promise.all([
      this.prisma.orgFollow.findMany({
        where: { followed_id: orgId },
        include: {
          follower: {
            select: {
              id: true,
              full_name: true,
              avatar_url: true,
              org_id: true,
              org: { select: { name: true, logo_url: true } }
            }
          }
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset
      }),
      this.prisma.orgFollow.count({ where: { followed_id: orgId } })
    ]);

    return {
      followers: followers.map((f) => ({
        id: f.follower.id,
        full_name: f.follower.full_name,
        avatar_url: f.follower.avatar_url,
        org_name: f.follower.org?.name,
        org_logo: f.follower.org?.logo_url,
        followed_at: f.created_at.toISOString()
      })),
      total
    };
  }

  /**
   * Get organizations a user is following
   */
  async getFollowing(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ following: any[]; total: number }> {
    const [following, total] = await Promise.all([
      this.prisma.orgFollow.findMany({
        where: { follower_id: userId },
        include: {
          followed: {
            select: {
              id: true,
              name: true,
              logo_url: true,
              org_type: true,
              verification_status: true
            }
          }
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset
      }),
      this.prisma.orgFollow.count({ where: { follower_id: userId } })
    ]);

    return {
      following: following.map((f) => ({
        id: f.followed.id,
        name: f.followed.name,
        logo_url: f.followed.logo_url,
        org_type: f.followed.org_type,
        is_verified: f.followed.verification_status === "approved",
        followed_at: f.created_at.toISOString()
      })),
      total
    };
  }

  /**
   * Get follower count for an organization
   */
  async getFollowerCount(orgId: string): Promise<number> {
    return this.prisma.orgFollow.count({ where: { followed_id: orgId } });
  }

  // ============================================
  // Share Tracking
  // ============================================

  /**
   * Track a share action
   */
  async trackShare(
    userId: string,
    entityType: "project" | "org" | "service",
    entityId: string,
    platform: SharePlatform
  ): Promise<ShareDto> {
    // Validate entity exists
    if (entityType === "project") {
      const project = await this.prisma.project.findUnique({ where: { id: entityId } });
      if (!project) throw new NotFoundException("Project not found");
    } else if (entityType === "org") {
      const org = await this.prisma.org.findUnique({ where: { id: entityId } });
      if (!org) throw new NotFoundException("Organization not found");
    }
    // Services may not have model yet - skip validation

    const share = await this.prisma.share.create({
      data: {
        id: randomUUID(),
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        platform
      }
    });

    return {
      id: share.id,
      user_id: share.user_id,
      entity_type: share.entity_type,
      entity_id: share.entity_id,
      platform: share.platform,
      created_at: share.created_at.toISOString()
    };
  }

  /**
   * Get share count for an entity
   */
  async getShareCount(entityType: string, entityId: string): Promise<number> {
    return this.prisma.share.count({
      where: { entity_type: entityType, entity_id: entityId }
    });
  }

  /**
   * Get share breakdown by platform
   */
  async getShareBreakdown(
    entityType: string,
    entityId: string
  ): Promise<Record<string, number>> {
    const shares = await this.prisma.share.groupBy({
      by: ["platform"],
      where: { entity_type: entityType, entity_id: entityId },
      _count: { platform: true }
    });

    return shares.reduce(
      (acc, s) => {
        acc[s.platform] = s._count.platform;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // ============================================
  // Activity Feed
  // ============================================

  /**
   * Create an activity feed item
   */
  async createActivity(
    orgId: string,
    actorId: string | null,
    activityType: ActivityType,
    title: string,
    options: {
      description?: string;
      entityType?: string;
      entityId?: string;
      metadata?: any;
      isPublic?: boolean;
    } = {}
  ): Promise<ActivityFeedItemDto> {
    const activity = await this.prisma.activityFeedItem.create({
      data: {
        id: randomUUID(),
        org_id: orgId,
        actor_id: actorId,
        activity_type: activityType,
        title,
        description: options.description ?? null,
        entity_type: options.entityType ?? null,
        entity_id: options.entityId ?? null,
        metadata: options.metadata ?? null,
        is_public: options.isPublic ?? true
      },
      include: {
        actor: { select: { id: true, full_name: true, avatar_url: true } },
        org: { select: { id: true, name: true, logo_url: true } }
      }
    });

    return this.mapActivity(activity);
  }

  /**
   * Get public activity feed for an organization
   */
  async getOrgActivityFeed(
    orgId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ activities: ActivityFeedItemDto[]; total: number }> {
    const [activities, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where: { org_id: orgId, is_public: true },
        include: {
          actor: { select: { id: true, full_name: true, avatar_url: true } },
          org: { select: { id: true, name: true, logo_url: true } }
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset
      }),
      this.prisma.activityFeedItem.count({
        where: { org_id: orgId, is_public: true }
      })
    ]);

    return {
      activities: activities.map((a) => this.mapActivity(a)),
      total
    };
  }

  /**
   * Get combined activity feed from followed organizations
   */
  async getFollowingActivityFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ activities: ActivityFeedItemDto[]; total: number }> {
    // Get list of followed org IDs
    const follows = await this.prisma.orgFollow.findMany({
      where: { follower_id: userId },
      select: { followed_id: true }
    });
    const followedOrgIds = follows.map((f) => f.followed_id);

    if (followedOrgIds.length === 0) {
      return { activities: [], total: 0 };
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where: {
          org_id: { in: followedOrgIds },
          is_public: true
        },
        include: {
          actor: { select: { id: true, full_name: true, avatar_url: true } },
          org: { select: { id: true, name: true, logo_url: true } }
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset
      }),
      this.prisma.activityFeedItem.count({
        where: {
          org_id: { in: followedOrgIds },
          is_public: true
        }
      })
    ]);

    return {
      activities: activities.map((a) => this.mapActivity(a)),
      total
    };
  }

  /**
   * Get global public activity feed (for discovery)
   */
  async getGlobalActivityFeed(
    limit: number = 20,
    offset: number = 0,
    activityTypes?: ActivityType[]
  ): Promise<{ activities: ActivityFeedItemDto[]; total: number }> {
    const where: any = { is_public: true };
    if (activityTypes?.length) {
      where.activity_type = { in: activityTypes };
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityFeedItem.findMany({
        where,
        include: {
          actor: { select: { id: true, full_name: true, avatar_url: true } },
          org: { select: { id: true, name: true, logo_url: true } }
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset
      }),
      this.prisma.activityFeedItem.count({ where })
    ]);

    return {
      activities: activities.map((a) => this.mapActivity(a)),
      total
    };
  }

  private mapActivity(db: any): ActivityFeedItemDto {
    return {
      id: db.id,
      org_id: db.org_id,
      actor_id: db.actor_id,
      activity_type: db.activity_type,
      entity_type: db.entity_type,
      entity_id: db.entity_id,
      title: db.title,
      description: db.description,
      metadata: db.metadata,
      is_public: db.is_public,
      created_at: db.created_at.toISOString(),
      actor: db.actor
        ? {
            id: db.actor.id,
            full_name: db.actor.full_name,
            avatar_url: db.actor.avatar_url
          }
        : undefined,
      org: db.org
        ? {
            id: db.org.id,
            name: db.org.name,
            logo_url: db.org.logo_url
          }
        : undefined
    };
  }

  /**
   * Get available activity types
   */
  getActivityTypes(): string[] {
    return [...ACTIVITY_TYPES];
  }
}
