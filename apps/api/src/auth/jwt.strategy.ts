import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from './auth.service';
import { JWT_SECRET, TOKEN_TYPE } from './constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== TOKEN_TYPE.ACCESS) {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or suspended');
    }

    return user;
  }
}
