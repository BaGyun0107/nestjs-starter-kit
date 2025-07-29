import { HttpException, Injectable } from '@nestjs/common';
import { LoginData, LoginResult } from '../interface/login.interface';
import { PasswordUtil } from 'src/common/utils/password.util';
import { GenerateTokenUtil } from '../utils/generateToken.util';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LoginSvc {
  private user: PrismaClient['user'];
  constructor(private readonly prisma: PrismaService) {
    this.user = this.prisma.user;
  }

  /**
   * @description 로그인 서비스
   * @param {LoginData} loginData - 로그인 데이터
   * @returns {Promise<LoginResult>} - 로그인 결과
   */
  async login(loginData: LoginData): Promise<LoginResult> {
    try {
      const { providerInfo, login_id, password, autoLogin } = loginData;

      const userInfo = await this.user.findFirst({
        where: {
          provider_id: providerInfo.id,
          login_id: login_id
        },
        select: {
          uuid: true,
          login_id: true,
          password: true,
          user_grade: {
            select: {
              code: true,
              is_admin: true
            }
          }
        }
      });

      if (!userInfo) {
        throw new HttpException('존재하지 않는 아이디입니다.', 401);
      }

      const isMatch = await PasswordUtil.verifyPassword(
        password,
        userInfo.password,
        providerInfo.pwd_key
      );

      if (!isMatch) {
        throw new HttpException('비밀번호가 일치하지 않습니다.', 402);
      }

      // userInfo 에 password 제거
      delete userInfo.password;

      // 토큰 생성 시 포함할 데이터
      const payload = {
        login_id: userInfo.login_id,
        user_grade: {
          code: userInfo.user_grade.code
        }
      };

      // 토큰 생성
      const { token: accessToken, exp: accessTokenExp } =
        GenerateTokenUtil.generateAccessToken(payload, providerInfo.ac_key);
      const { token: refreshToken, exp: refreshTokenExp } =
        GenerateTokenUtil.generateRefreshToken(
          payload,
          providerInfo.re_key,
          autoLogin
        );

      return {
        user: userInfo,
        accessToken,
        refreshToken,
        accessTokenExp,
        refreshTokenExp
      };
    } catch (err) {
      throw err;
    }
  }
}
