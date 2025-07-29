import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { GetIpUtil } from '../utils/getIp.util';

/**
 * @description 인증 가드
 * 요청 헤더에 인증키와 프로바이더 정보가 있는지 검사
 */
@Injectable()
export class AuthorizeGuard implements CanActivate {
  private readonly publicIps = [];

  constructor(private readonly config: ConfigService) {}

  /**
   * @description 인증 가드 활성화 여부 검사
   * @param {ExecutionContext} context - 실행 컨텍스트
   * @returns {Promise<boolean>} - 인증 가드 활성화 여부
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const ip = GetIpUtil.getIp(context);

    const { authorization } = req.headers as {
      authorization: string;
    };

    try {
      // 인증키 검사
      if (!authorization || authorization !== this.config.get('API_AUTH_KEY')) {
        throw new HttpException('인증키가 없습니다', 401);
      }

      // 로컬·공용 IP 허용
      if (this.publicIps.includes(ip)) {
        return true;
      }

      return true;
    } catch (err) {
      // 이미 HttpException 이거나 InternalServerErrorException 이면 그대로 던지고,
      if (err instanceof HttpException) {
        throw err;
      }
      // 그 외 예외는 500 InternalServerError로 감싸서 던집니다.
      throw new InternalServerErrorException(
        err?.message || '알 수 없는 서버 에러'
      );
    }
  }
}
