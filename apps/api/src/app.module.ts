import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { ProfileModule } from "./profile/profile.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProjectsModule } from "./projects/projects.module";
import { ProjectDocumentsModule } from "./project-documents/project-documents.module";
import { IecModule } from "./iec/iec.module";
import { MatchingModule } from "./matching/matching.module";
import { AdminModule } from "./admin/admin.module";
import { OrgModule } from "./org/org.module";
import { PublicProjectModule } from "./public-project/public-project.module";
import { DataRoomModule } from "./data-room/data-room.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { DirectoryModule } from "./directory/directory.module";
import { ServicesModule } from "./services/services.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { SearchModule } from "./search/search.module";
import { SocialModule } from "./social/social.module";
import { EventsModule } from "./events/events.module";
// import { OAModule } from "./oa/oa.module";
// import { CalendarModule } from "./calendar/calendar.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfileModule,
    ProjectsModule,
    ProjectDocumentsModule,
    IecModule,
    MatchingModule,
    DataRoomModule,
    NotificationsModule,
    DirectoryModule,
    ServicesModule,
    OrgModule,
    PublicProjectModule,
    AdminModule,
    AnalyticsModule,
    SearchModule,
    SocialModule,
    EventsModule,
    // TODO: Add these modules after schema migration
    // OAModule,
    // CalendarModule,
  ]
})
export class AppModule {}

