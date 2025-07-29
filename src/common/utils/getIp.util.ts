import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class GetIpUtil {
  /**
   * @param {ExecutionContext} context - 실행 컨텍스트
   * @returns {string} - 클라이언트 IP
   * @description 클라이언트 IP 반환
   */
  static getIp(context: ExecutionContext): string {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const headers = ['cf-connecting-ip', 'x-forwarded-for', 'x-real-ip'];

    for (const h of headers) {
      if (req.headers[h]) {
        const ip = (req.headers[h] as string).split(',')[0].trim();
        return ip.replace(/^::ffff:/, '');
      }
    }

    const ip = req.socket.remoteAddress || '';
    return ip.replace(/^::ffff:/, '');
  }
}
