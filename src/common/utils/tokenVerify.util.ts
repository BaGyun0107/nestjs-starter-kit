import { HttpException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { user } from 'prisma/generated/prisma-client-js';

export class TokenVerifyUtil {
  /**
   * @description 액세스 토큰 검증
   * @param {string} token - 액세스 토큰
   * @param {string} key - 액세스 토큰 키
   * @returns {void} - 검증된 토큰 데이터
   */
  static verifyAccessToken(token: string, key: string): Partial<user> {
    try {
      const decoded = jwt.verify(token, key) as Partial<user>;

      if (!decoded) {
        throw new HttpException('토큰 정보가 없습니다.', 401);
      }

      return decoded;
    } catch {
      throw new HttpException('[AccessToken] 토큰이 유효하지 않습니다.', 400);
    }
  }

  /**
   * @description 리프레시 토큰 검증
   * @param {string} token - 리프레시 토큰
   * @param {string} key - 리프레시 토큰 키
   * @returns {void} - 검증된 토큰 데이터
   */
  static verifyRefreshToken(token: string, key: string): Partial<user> {
    try {
      const decoded = jwt.verify(token, key) as Partial<user>;

      if (!decoded) {
        throw new HttpException('토큰 정보가 없습니다.', 401);
      }

      return decoded;
    } catch {
      throw new HttpException('[RefreshToken] 토큰이 유효하지 않습니다.', 400);
    }
  }
}
