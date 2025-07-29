import { HttpException, Injectable } from '@nestjs/common';
import { SignUpData } from '../interface/signUp.interface';
import { BcryptUtil } from 'src/common/utils/bcypt.util';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SignUpSvc {
  private user: PrismaClient['user'];
  private userGrade: PrismaClient['user_grade'];

  constructor(private readonly prisma: PrismaService) {
    this.user = this.prisma.user;
    this.userGrade = this.prisma.user_grade;
  }

  async signUp(signUpData: SignUpData) {
    try {
      const { providerInfo, user_code, login_id, password } = signUpData;

      if (!providerInfo) {
        throw new HttpException('Provider 정보가 없습니다.', 400);
      }

      const userInfo = await this.user.findFirst({
        where: {
          provider_id: providerInfo.id,
          login_id: login_id
        }
      });

      if (userInfo) {
        throw new HttpException('이미 존재하는 아이디입니다.', 299);
      }

      const userGradeInfo = await this.userGrade.findFirst({
        where: {
          code: user_code,
          provider_id: providerInfo.id
        }
      });

      if (!userGradeInfo) {
        throw new HttpException('유저 등급 정보가 없습니다.', 400);
      }

      const hash = await BcryptUtil.hash(password, providerInfo.pwd_key);

      const userData = await this.user.create({
        data: {
          uuid: uuidv4(),
          provider_id: providerInfo.id,
          login_id: login_id,
          password: hash,
          user_grade_id: userGradeInfo.id
        }
      });

      // 패스워드 제거
      delete userData.password;

      return userData;
    } catch (err) {
      throw err;
    }
  }
}
