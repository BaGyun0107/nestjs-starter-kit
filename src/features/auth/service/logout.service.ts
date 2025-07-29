import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class LogoutSvc {
  async logout(res: Response): Promise<boolean> {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return true;
  }
}
