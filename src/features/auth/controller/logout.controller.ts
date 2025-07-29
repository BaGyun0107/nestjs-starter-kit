import { Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LogoutSvc } from '../service/logout.service';

@Controller('auth')
export class LogoutCtrl {
  constructor(private readonly logoutSvc: LogoutSvc) {}

  /**
   * @description 로그아웃 API
   * @param {Response} res - 응답 객체
   * @returns {Promise<{ message: string }>}
   */
  @Post('logout')
  async logout(@Res() res: Response): Promise<{ message: string }> {
    try {
      await this.logoutSvc.logout(res);

      return {
        message: '로그아웃 성공'
      };
    } catch (err) {
      throw err;
    }
  }
}
