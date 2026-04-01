import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

/** Matches public self-serve signup on web (`/register`). Admin/staff accounts use other flows. */
const REGISTER_USER_TYPES = ['startup', 'investor'] as const;

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsIn(REGISTER_USER_TYPES)
  user_type!: (typeof REGISTER_USER_TYPES)[number];

  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class ResendVerificationDto {
  @IsEmail()
  email!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @MinLength(8)
  new_password!: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}
