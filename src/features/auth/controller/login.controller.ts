import { Controller, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { LoginSvc } from '../service/login.service';
import { LoginDto } from '../dto/login.dto';
import { LoginData, LoginResult } from '../interface/login.interface';

@Controller('auth')
export class LoginCtrl {
  constructor(private readonly loginSvc: LoginSvc) {}

  /**
   * @description 로그인 API
   * @param {Request} req - 요청 객체
   * @param {LoginDto} loginDto - 로그인 데이터
   * @returns {Promise<{ message: string; data: LoginResult }>}
   */
  @Post('login')
  async loginCtrl(
    @Req() req: Request,
    @Body() loginDto: LoginDto
  ): Promise<{ message: string; data: LoginResult }> {
    try {
      const loginData: LoginData = {
        ...loginDto,
        providerInfo: req.providerInfo
      };

      const result = await this.loginSvc.login(loginData);

      return {
        message: '로그인 성공',
        data: result
      };
    } catch (err) {
      throw err;
    }
  }
}
