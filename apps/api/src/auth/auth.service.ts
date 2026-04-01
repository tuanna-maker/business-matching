import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  RefreshTokenDto,
  UpdateProfileDto,
} from './dto';
import { JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, TOKEN_TYPE } from './constants';

export interface JwtPayload {
  sub: string;
  email: string;
  type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  user_type: string;
  approval_status: string;
  email_verified: boolean;
  org_id?: string;
  org?: any;
  startup_profile?: any;
  investor_profile?: any;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private generateTokens(user: { id: string; email: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: TOKEN_TYPE.ACCESS,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    const refreshPayload = { ...payload, type: TOKEN_TYPE.REFRESH };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: JWT_SECRET,
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  private generateVerificationToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: TOKEN_TYPE.EMAIL_VERIFICATION },
      { secret: JWT_SECRET, expiresIn: '24h' },
    );
  }

  private formatUser(dbUser: any): AuthUser {
    return {
      id: dbUser.id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      phone: dbUser.phone || undefined,
      avatar_url: dbUser.avatar_url || undefined,
      user_type: dbUser.user_type,
      approval_status: dbUser.approval_status,
      // email_verified = true when approval_status is 'approved'
      email_verified: dbUser.approval_status === 'approved',
      org_id: dbUser.org_id || undefined,
      org: dbUser.org || undefined,
      startup_profile: dbUser.startup_profile || undefined,
      investor_profile: dbUser.investor_profile || undefined,
    };
  }

  async register(dto: RegisterDto) {
    // Check if email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: dto.email.toLowerCase(),
        password_hash: passwordHash,
        full_name: dto.full_name,
        phone: dto.phone,
        user_type: dto.user_type,
        approval_status: 'pending',
      },
      include: {
        org: true,
        startup_profile: true,
        investor_profile: true,
      },
    });

    // Generate verification token
    const verificationToken = this.generateVerificationToken(user.id);

    // TODO: Send email with verification token
    console.log(`[Email Verification] Token for ${user.email}: ${verificationToken}`);

    const tokens = this.generateTokens(user);

    return {
      success: true,
      user: this.formatUser(user),
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        org: true,
        startup_profile: true,
        investor_profile: true,
      },
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await this.verifyPassword(dto.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.approval_status === 'rejected') {
      throw new UnauthorizedException('Account not approved');
    }

    const tokens = this.generateTokens(user);

    return {
      success: true,
      user: this.formatUser(user),
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    try {
      const payload = this.jwtService.verify(dto.token, { secret: JWT_SECRET });

      if (payload.type !== TOKEN_TYPE.EMAIL_VERIFICATION) {
        throw new BadRequestException('Invalid token type');
      }

      const user = await this.prisma.user.update({
        where: { id: payload.sub },
        data: { approval_status: 'approved' },
        include: {
          org: true,
          startup_profile: true,
          investor_profile: true,
        },
      });

      const tokens = this.generateTokens(user);

      return {
        success: true,
        user: this.formatUser(user),
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        message: 'Email verified successfully',
      };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        success: true,
        message: 'If the email exists, a verification link has been sent.',
      };
    }

    if (user.approval_status === 'approved') {
      return {
        success: true,
        message: 'Email already verified.',
      };
    }

    const verificationToken = this.generateVerificationToken(user.id);

    // TODO: Send email
    console.log(`[Email Verification] Resend token for ${user.email}: ${verificationToken}`);

    return {
      success: true,
      message: 'Verification email sent.',
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refresh_token, { secret: JWT_SECRET });

      if (payload.type !== TOKEN_TYPE.REFRESH) {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.approval_status === 'rejected') {
        throw new UnauthorizedException('User not found or not approved');
      }

      const tokens = this.generateTokens(user);

      return {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_in: 604800, // 7 days in seconds
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        org: true,
        startup_profile: true,
        investor_profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      user: this.formatUser(user),
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        full_name: dto.full_name,
        phone: dto.phone,
        avatar_url: dto.avatar_url,
      },
      include: {
        org: true,
        startup_profile: true,
        investor_profile: true,
      },
    });

    return {
      success: true,
      user: this.formatUser(user),
    };
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        org: true,
        startup_profile: true,
        investor_profile: true,
      },
    });

    if (!user || user.approval_status === 'rejected') {
      return null;
    }

    return this.formatUser(user);
  }
}
