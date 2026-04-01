import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard that requires the user to have an organization profile (startup or investor)
 * Must be used after JwtAuthGuard
 */
@Injectable()
export class OARequiredGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has either startup_profile or investor_profile
    if (!user.startup_profile && !user.investor_profile) {
      throw new ForbiddenException('Organization profile required. Please complete your profile setup.');
    }

    return true;
  }
}
