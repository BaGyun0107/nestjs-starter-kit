import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../../features/auth/utils/token.util';
import {
  CookieUtil,
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_CSRF_TOKEN_COOKIE
} from '../../features/auth/utils/cookie.util';
import { LoggerService } from '../../features/log/service/logger.service';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenUtil: TokenUtil,
    private readonly cookieUtil: CookieUtil,
    private readonly logger: LoggerService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies[ADMIN_ACCESS_TOKEN_COOKIE];
    const refreshToken = req.cookies[ADMIN_REFRESH_TOKEN_COOKIE];

    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD' &&
      req.method !== 'OPTIONS'
    ) {
      const csrfCookie = req.cookies[ADMIN_CSRF_TOKEN_COOKIE];
      const csrfHeader = req.get('X-CSRF-Token');

      if (!csrfHeader || !csrfCookie || csrfCookie !== csrfHeader) {
        this.logger.debug(
          `[ADMIN-AUTH] CSRF Mismatch { header: ${csrfHeader}, cookie: ${csrfCookie} }`
        );
        throw new Error('CSRF Mismatch');
      }
    }

    // 1. Access Token 유효성 검사
    if (accessToken) {
      const { payload, expired } =
        this.tokenUtil.verifyAccessToken(accessToken);
      if (payload && !expired) {
        req.user = payload; // 유효함
        return next();
      }
    }

    // 2. Access Token 만료/없음 -> Refresh Token 검사 및 Rotation
    if (refreshToken) {
      this.logger.debug(
        '[ADMIN-AUTH] Access Token expired/missing. Attempting refresh.'
      );
      const { payload: refreshPayload } =
        this.tokenUtil.verifyRefreshToken(refreshToken);

      if (refreshPayload && refreshPayload.uuid) {
        this.logger.debug('[ADMIN-AUTH] Valid Refresh Token. Rotating tokens.');

        // Remember Me 로직: 만료까지 8일 이상 남았으면 True로 간주
        // refreshPayload.exp 는 초 단위, payload.iat 도 초 단위.
        // 하지만 iat가 없을 수도 있으니 exp - now 로 계산하는게 안전.
        const now = Math.floor(Date.now() / 1000);
        const diff = refreshPayload.exp - now;
        const isRememberMe = diff > 60 * 60 * 24 * 8; // 8일 이상

        // 새 토큰 생성
        const newAccessToken = this.tokenUtil.generateAccessToken(
          refreshPayload.uuid
        );
        const newRefreshToken = this.tokenUtil.generateRefreshToken(
          refreshPayload.uuid,
          isRememberMe
        );

        // 쿠키 재설정 (관리자용)
        this.cookieUtil.setAdminAuthCookies(
          res,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          },
          isRememberMe,
          req
        );

        // req.user 설정 (새 토큰의 페이로드를 사용하거나, refreshPayload 사용)
        req.user = { uuid: refreshPayload.uuid };

        // 중요: 다음 미들웨어나 가드에서 쿠키를 읽을 때 갱신된 값을 참조할 수 있도록 req.cookies 업데이트
        req.cookies[ADMIN_ACCESS_TOKEN_COOKIE] = newAccessToken;
        req.cookies[ADMIN_REFRESH_TOKEN_COOKIE] = newRefreshToken;

        return next();
      } else {
        this.logger.debug('[ADMIN-AUTH] Invalid Refresh Token.');
      }
    }

    // 3. 인증 실패: 쿠키 정리
    // 단, 여기서 무조건 지우면 비로그인 접근 가능한 페이지에서도 쿠키가 날아갈 수 있음.
    // 하지만 Refresh Token이 invalid하다는 건 명시적으로 로그아웃 처리가 필요한 상황임.
    if (accessToken || refreshToken) {
      this.logger.debug('[ADMIN-AUTH] Auth failed. Clearing cookies.');
      this.cookieUtil.clearAdminAuthCookies(res);
    }

    req.user = null;
    return next();
  }
}
