import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { UserType } from "@iec-hub/shared";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly allowed: UserType[] = []) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { user_type?: UserType } | undefined;
    if (!user) return false;
    if (!this.allowed.length) return true;
    return this.allowed.includes(user.user_type as UserType);
  }
}

