import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable
} from '@nestjs/common';
import { TokenVerifyUtil } from '../utils/tokenVerify.util';

/**
 * @description 액세스 토큰 가드
 * 요청 헤더에 액세스 토큰이 있는지 검사
 */
@Injectable()
export class AuthTokenGuard implements CanActivate {
  /**
   * @description 액세스 토큰 가드 활성화 여부 검사
   * @param {ExecutionContext} context - 실행 컨텍스트
   * @returns {boolean} - 액세스 토큰 가드 활성화 여부
   */
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const { providerInfo } = req;
    const { ca_at } = req.cookies;

    try {
      if (!ca_at) {
        throw new HttpException('[AccessToken] 토큰이 없습니다.', 401);
      }

      const decoded = TokenVerifyUtil.verifyAccessToken(
        ca_at,
        providerInfo.ac_key
      );

      req.user = decoded;
      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new HttpException('[AccessToken] 토큰이 유효하지 않습니다.', 402);
    }
  }
}
