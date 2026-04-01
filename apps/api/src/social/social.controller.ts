import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import {
  SocialService,
  FollowDto,
  ShareDto,
  ActivityFeedItemDto,
  SharePlatform,
  ActivityType,
  SHARE_PLATFORMS,
  ACTIVITY_TYPES
} from "./social.service";

@Controller("social")
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ============================================
  // Follow Endpoints
  // ============================================

  /**
   * Follow an organization
   * POST /social/follow/:orgId
   */
  @Post("follow/:orgId")
  async followOrg(
    @Param("orgId") orgId: string,
    @Req() req: any
  ): Promise<FollowDto> {
    const userId = req.user.id as string;
    return this.socialService.followOrg(userId, orgId);
  }

  /**
   * Unfollow an organization
   * DELETE /social/follow/:orgId
   */
  @Delete("follow/:orgId")
  async unfollowOrg(
    @Param("orgId") orgId: string,
    @Req() req: any
  ): Promise<{ success: boolean }> {
    const userId = req.user.id as string;
    await this.socialService.unfollowOrg(userId, orgId);
    return { success: true };
  }

  /**
   * Check if current user follows an org
   * GET /social/follow/:orgId/status
   */
  @Get("follow/:orgId/status")
  async getFollowStatus(
    @Param("orgId") orgId: string,
    @Req() req: any
  ): Promise<{ is_following: boolean }> {
    const userId = req.user.id as string;
    const isFollowing = await this.socialService.isFollowing(userId, orgId);
    return { is_following: isFollowing };
  }

  /**
   * Get organizations current user is following
   * GET /social/following
   */
  @Get("following")
  async getFollowing(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Req() req?: any
  ): Promise<{ following: any[]; total: number }> {
    const userId = req.user.id as string;
    return this.socialService.getFollowing(
      userId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0
    );
  }

  /**
   * Get followers of an organization
   * GET /social/orgs/:orgId/followers
   */
  @Get("orgs/:orgId/followers")
  async getOrgFollowers(
    @Param("orgId") orgId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ): Promise<{ followers: any[]; total: number }> {
    return this.socialService.getFollowers(
      orgId,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0
    );
  }

  /**
   * Get follower count for an organization
   * GET /social/orgs/:orgId/follower-count
   */
  @Get("orgs/:orgId/follower-count")
  async getFollowerCount(
    @Param("orgId") orgId: string
  ): Promise<{ count: number }> {
    const count = await this.socialService.getFollowerCount(orgId);
    return { count };
  }

  // ============================================
  // Share Endpoints
  // ============================================

  /**
   * Track a share action
   * POST /social/share
   */
  @Post("share")
  async trackShare(
    @Body()
    body: {
      entity_type: "project" | "org" | "service";
      entity_id: string;
      platform: string;
    },
    @Req() req: any
  ): Promise<ShareDto> {
    const userId = req.user.id as string;
    const platform = body.platform as SharePlatform;
    
    if (!SHARE_PLATFORMS.includes(platform)) {
      throw new Error(`Invalid platform. Must be one of: ${SHARE_PLATFORMS.join(", ")}`);
    }
    
    return this.socialService.trackShare(
      userId,
      body.entity_type,
      body.entity_id,
      platform
    );
  }

  /**
   * Get share count for an entity
   * GET /social/shares/:entityType/:entityId/count
   */
  @Get("shares/:entityType/:entityId/count")
  async getShareCount(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string
  ): Promise<{ count: number }> {
    const count = await this.socialService.getShareCount(entityType, entityId);
    return { count };
  }

  /**
   * Get share breakdown by platform
   * GET /social/shares/:entityType/:entityId/breakdown
   */
  @Get("shares/:entityType/:entityId/breakdown")
  async getShareBreakdown(
    @Param("entityType") entityType: string,
    @Param("entityId") entityId: string
  ): Promise<{ breakdown: Record<string, number> }> {
    const breakdown = await this.socialService.getShareBreakdown(
      entityType,
      entityId
    );
    return { breakdown };
  }

  // ============================================
  // Activity Feed Endpoints
  // ============================================

  /**
   * Get activity feed from followed organizations
   * GET /social/feed
   */
  @Get("feed")
  async getFollowingFeed(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Req() req?: any
  ): Promise<{ activities: ActivityFeedItemDto[]; total: number }> {
    const userId = req.user.id as string;
    return this.socialService.getFollowingActivityFeed(
      userId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0
    );
  }

  /**
   * Get global activity feed for discovery
   * GET /social/feed/global
   */
  @Get("feed/global")
  async getGlobalFeed(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Query("types") types?: string
  ): Promise<{ activities: ActivityFeedItemDto[]; total: number }> {
    const activityTypes = types
      ? (types.split(",").filter((t) => ACTIVITY_TYPES.includes(t as ActivityType)) as ActivityType[])
      : undefined;

    return this.socialService.getGlobalActivityFeed(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
      activityTypes
    );
  }

  /**
   * Get activity feed for a specific organization
   * GET /social/orgs/:orgId/feed
   */
  @Get("orgs/:orgId/feed")
  async getOrgFeed(
    @Param("orgId") orgId: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string
  ): Promise<{ activities: ActivityFeedItemDto[]; total: number }> {
    return this.socialService.getOrgActivityFeed(
      orgId,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0
    );
  }

  /**
   * Create an activity post (for org admins)
   * POST /social/activity
   */
  @Post("activity")
  async createActivity(
    @Body()
    body: {
      activity_type: string;
      title: string;
      description?: string;
      entity_type?: string;
      entity_id?: string;
      metadata?: any;
      is_public?: boolean;
    },
    @Req() req: any
  ): Promise<ActivityFeedItemDto> {
    const userId = req.user.id as string;
    const orgId = req.user.org_id as string;

    if (!orgId) {
      throw new Error("User must belong to an organization to create activities");
    }

    const activityType = body.activity_type as ActivityType;
    if (!ACTIVITY_TYPES.includes(activityType)) {
      throw new Error(`Invalid activity type. Must be one of: ${ACTIVITY_TYPES.join(", ")}`);
    }

    return this.socialService.createActivity(orgId, userId, activityType, body.title, {
      description: body.description,
      entityType: body.entity_type,
      entityId: body.entity_id,
      metadata: body.metadata,
      isPublic: body.is_public
    });
  }

  /**
   * Get available activity types
   * GET /social/activity-types
   */
  @Get("activity-types")
  getActivityTypes(): { types: string[] } {
    return { types: this.socialService.getActivityTypes() };
  }

  /**
   * Get available share platforms
   * GET /social/share-platforms
   */
  @Get("share-platforms")
  getSharePlatforms(): { platforms: string[] } {
    return { platforms: [...SHARE_PLATFORMS] };
  }
}
