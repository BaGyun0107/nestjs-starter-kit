import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const CSRF_TOKEN_COOKIE = 'csrf_token';

const ACCESS_TOKEN_MAX_AGE = 60 * 10 * 1000; // 10 minutes (ms)
const CSRF_TOKEN_MAX_AGE = 60 * 10 * 1000; // 10 minutes (ms)
const REFRESH_TOKEN_MAX_AGE_DEFAULT = 60 * 60 * 24 * 7 * 1000; // 7 days (ms)
const REFRESH_TOKEN_MAX_AGE_LONG = 60 * 60 * 24 * 365 * 1000; // 1 year (ms)

@Injectable()
export class CookieUtil {
  constructor(private readonly configService: ConfigService) {}

  setAuthCookies(
    res: Response,
    token: { accessToken: string; refreshToken: string; csrfToken: string },
    rememberMe: boolean = false,
    req?: Request
  ) {
    const { accessToken, refreshToken, csrfToken } = token;

    const isProduction = this.configService.get<string>('env') === 'production';
    const isHTTPS =
      isProduction ||
      (req &&
        (req.headers['x-forwarded-proto'] === 'https' ||
          req.headers['x-forwarded-ssl'] === 'on'));

    const cookieDomain =
      this.configService.get<string>('COOKIE_DOMAIN') || undefined;

    const commonOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      domain: cookieDomain,
      secure: isProduction || isHTTPS
    };

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...commonOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE
    });

    res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
      ...commonOptions,
      httpOnly: false,
      maxAge: CSRF_TOKEN_MAX_AGE
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...commonOptions,
      maxAge: rememberMe
        ? REFRESH_TOKEN_MAX_AGE_LONG
        : REFRESH_TOKEN_MAX_AGE_DEFAULT
    });
  }

  clearAuthCookies(res: Response) {
    const cookieDomain =
      this.configService.get<string>('COOKIE_DOMAIN') || undefined;
    const options = { path: '/', domain: cookieDomain };

    res.clearCookie(ACCESS_TOKEN_COOKIE, options);
    res.clearCookie(REFRESH_TOKEN_COOKIE, options);
    res.clearCookie(CSRF_TOKEN_COOKIE, options);
  }
}
