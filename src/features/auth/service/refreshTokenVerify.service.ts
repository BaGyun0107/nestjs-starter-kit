import { HttpException, Injectable } from '@nestjs/common';
import {
  RefreshTokenData,
  RefreshTokenVerifyResult
} from '../interface/refreshTokenVerify.interface';
import { GenerateTokenUtil } from '../utils/generateToken.util';
import { TokenVerifyUtil } from 'src/common/utils/tokenVerify.util';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RefreshTokenVerifySvc {
  private user: PrismaClient['user'];

  constructor(private readonly prisma: PrismaService) {
    this.user = this.prisma.user;
  }

  /**
   * @description 리프레시 토큰 검증
   * @param {RefreshTokenData} refreshTokenData - 리프레시 토큰 데이터
   * @returns {Promise<RefreshTokenVerifyResult>} - 검증 결과
   */
  async refreshTokenVerify(
    refreshTokenData: RefreshTokenData
  ): Promise<RefreshTokenVerifyResult> {
    const { ca_rt, providerInfo } = refreshTokenData;

    try {
      const tokenInfo = TokenVerifyUtil.verifyRefreshToken(
        ca_rt,
        providerInfo.re_key
      );

      const newUser = await this.user.findFirst({
        where: {
          login_id: tokenInfo.login_id,
          provider_id: providerInfo.id
        },
        select: {
          uuid: true,
          login_id: true,
          user_grade: {
            select: {
              code: true,
              is_admin: true
            }
          }
        }
      });

      if (!newUser) {
        throw new HttpException('존재하지 않는 유저입니다.', 402);
      }

      // 토큰 생성 시 포함할 데이터
      const payload = {
        login_id: newUser.login_id,
        user_grade: {
          code: newUser.user_grade.code
        }
      };

      const { token: newAccessToken, exp: newAccessTokenExp } =
        GenerateTokenUtil.generateAccessToken(payload, providerInfo.ac_key);

      return {
        user: newUser,
        accessToken: newAccessToken,
        accessTokenExp: newAccessTokenExp
      };
    } catch (err) {
      throw err;
    }
  }
}
