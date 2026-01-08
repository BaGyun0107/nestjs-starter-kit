import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export interface TokenVerification {
  payload: { uuid: string; iat: number; exp: number } | null;
  expired: boolean;
  error: any;
}

@Injectable()
export class TokenUtil {
  constructor(private readonly configService: ConfigService) {}

  get accessTokenSecret(): string {
    const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) throw new Error('ACCESS_TOKEN_SECRET is not defined');
    return secret;
  }

  get refreshTokenSecret(): string {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not defined');
    return secret;
  }

  get csrfTokenSecret(): string {
    const secret = this.configService.get<string>('CSRF_TOKEN_SECRET');
    if (!secret) throw new Error('CSRF_TOKEN_SECRET is not defined');
    return secret;
  }

  generateAccessToken(payload: string | { uuid: string; [key: string]: any }) {
    const tokenPayload =
      typeof payload === 'string' ? { uuid: payload } : payload;
    return jwt.sign(tokenPayload, this.accessTokenSecret, { expiresIn: '10m' });
  }

  generateRefreshToken(uuid: string, rememberMe: boolean = false) {
    const expiresIn = rememberMe ? '365d' : '7d';
    return jwt.sign({ uuid }, this.refreshTokenSecret, { expiresIn });
  }

  generateCSRFToken(rememberMe: boolean = false) {
    const expiresIn = rememberMe ? '365d' : '10m';
    return jwt.sign({ key: uuidv4() }, this.csrfTokenSecret, {
      expiresIn
    });
  }

  verifyAccessToken(token: string): TokenVerification {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as {
        uuid: string;
        iat: number;
        exp: number;
      };
      return { payload, expired: false, error: null };
    } catch (error: any) {
      const expired = error.name === 'TokenExpiredError';
      return { payload: null, expired, error };
    }
  }

  verifyRefreshToken(token: string): TokenVerification {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret) as {
        uuid: string;
        iat: number;
        exp: number;
      };
      return { payload, expired: false, error: null };
    } catch (error: any) {
      const expired = error.name === 'TokenExpiredError';
      return { payload: null, expired, error };
    }
  }

  verifyCSRFToken(token: string) {
    try {
      return jwt.verify(token, this.csrfTokenSecret);
    } catch {
      return null;
    }
  }
}
