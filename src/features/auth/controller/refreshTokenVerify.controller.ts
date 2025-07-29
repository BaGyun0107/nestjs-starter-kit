import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import {
  RefreshTokenData,
  RefreshTokenVerifyResult
} from '../interface/refreshTokenVerify.interface';
import { RefreshTokenVerifySvc } from '../service/refreshTokenVerify.service';

@Controller('auth')
export class RefreshTokenVerifyCtrl {
  constructor(private readonly refreshTokenVerifySvc: RefreshTokenVerifySvc) {}

  /**
   * @description 리프레시 토큰 검증 API
   * @param {Request} req - 요청 객체
   * @returns {Promise<{ message: string, data: RefreshTokenVerifyResult }>}
   */
  @Get('refresh')
  async refreshTokenVerify(
    @Req() req: Request
  ): Promise<{ message: string; data: RefreshTokenVerifyResult }> {
    try {
      const { ca_rt } = req.cookies;
      const providerInfo = req['providerInfo'];

      const refreshTokenData: RefreshTokenData = {
        ca_rt,
        providerInfo
      };

      const result =
        await this.refreshTokenVerifySvc.refreshTokenVerify(refreshTokenData);

      return {
        message: 'RefreshToken 검증 성공',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          accessTokenExp: result.accessTokenExp
        }
      };
    } catch (err) {
      throw err;
    }
  }
}
