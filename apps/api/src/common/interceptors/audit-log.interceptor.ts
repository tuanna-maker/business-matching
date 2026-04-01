import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as
      | { id?: string; org_id?: string | null; user_type?: string }
      | undefined;
    const { method, url, body } = request;

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const entityType = this.inferEntityType(url);
          await this.prisma.auditLog.create({
            data: {
              org_id: user?.org_id ?? null,
              actor_id: user?.id ?? null,
              actor_type: user?.user_type ?? null,
              action: method,
              entity_type: entityType,
              entity_id: null,
              payload_before: Prisma.JsonNull,
              payload_after:
                responseBody === undefined ? Prisma.JsonNull : (responseBody as any)
            }
          });
        } catch {
          // Ignore audit logging errors
        }
      })
    );
  }

  private inferEntityType(url: string): string {
    if (url.includes("/projects")) return "project";
    if (url.includes("/iec")) return "iec_assessment";
    if (url.includes("/matching")) return "match";
    if (url.includes("/auth")) return "auth";
    return "unknown";
  }
}
