/**
 * Auth Constants
 */

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'iec-hub-jwt-secret-change-in-production';
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '7d';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Token types
export const TOKEN_TYPE = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
} as const;
