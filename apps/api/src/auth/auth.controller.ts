import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  ResendVerificationDto,
  RefreshTokenDto,
  UpdateProfileDto,
} from './dto';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: { user: { id: string } }) {
    return this.authService.getMe(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req: { user: { id: string } }, @Body() dto: UpdateProfileDto) {
    return this.authService.updateMe(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    // For JWT, logout is client-side (remove token)
    // Could implement token blacklist here if needed
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}
