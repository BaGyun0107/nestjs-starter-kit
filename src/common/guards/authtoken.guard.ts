import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';

/**
 * @description 액세스 토큰 가드
 * AuthMiddleware가 이미 검증하고 req.user를 설정했다고 가정
 */
@Injectable()
export class AuthTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // AuthMiddleware에서 설정한 사용자 정보 확인
    if (!req.user) {
      throw new UnauthorizedException('[AuthGuard] 로그인이 필요합니다.');
    }

    return true;
  }
}
