import { Body, Controller, Post, Req } from '@nestjs/common';
import { SignUpSvc } from '../service/signUp.service';
import { SignUpData } from '../interface/signUp.interface';
import { SignUpDto } from '../dto/signUp.dto';
import { Request } from 'express';

@Controller('auth')
export class SignUpCtrl {
  constructor(private readonly signUpSvc: SignUpSvc) {}

  @Post('signup')
  async signUp(@Req() req: Request, @Body() signUpDto: SignUpDto) {
    const signUpData: SignUpData = {
      ...signUpDto,
      providerInfo: req.providerInfo
    };

    try {
      const result = await this.signUpSvc.signUp(signUpData);
      return {
        message: '회원가입이 완료되었습니다.',
        data: result
      };
    } catch (error) {
      throw error;
    }
  }
}
