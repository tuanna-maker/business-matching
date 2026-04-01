import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        e.id,
        e.title,
        e.description,
        e.short_description,
        e.event_type,
        e.meeting_link,
        e.location,
        e.address,
        e.start_time  AS start_at,
        e.end_time    AS end_at,
        e.timezone,
        e.max_attendees,
        e.current_attendees,
        e.cover_image_url,
        e.status,
        e.is_public,
        e.requires_approval,
        e.view_count,
        e.created_at,
        pu.full_name  AS creator_name,
        pu.email      AS creator_email
      FROM "Event" e
      JOIN "PilotUser" pu ON pu.id = e.creator_id
      WHERE e.status = 'PUBLISHED' AND e.is_public = true
      ORDER BY e.start_time ASC
    `;

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? r.short_description,
      event_type: this.mapEventType(r.event_type),
      start_at: r.start_at,
      end_at: r.end_at,
      location: r.location ?? r.address,
      meeting_link: r.meeting_link,
      cover_image_url: r.cover_image_url,
      max_attendees: r.max_attendees,
      current_attendees: Number(r.current_attendees),
      requires_approval: r.requires_approval,
      creator_name: r.creator_name,
      created_at: r.created_at,
    }));
  }

  private mapEventType(dbType: string): string {
    const map: Record<string, string> = {
      ONLINE: 'call',
      OFFLINE: 'meeting',
      HYBRID: 'workshop',
    };
    return map[dbType] ?? 'meeting';
  }
}
