import { Module } from '@nestjs/common';
import { LoginCtrl } from './controller/login.controller';
import { LoginSvc } from './service/login.service';
import { LogoutCtrl } from './controller/logout.controller';
import { LogoutSvc } from './service/logout.service';
import { RefreshTokenVerifyCtrl } from './controller/refreshTokenVerify.controller';
import { RefreshTokenVerifySvc } from './service/refreshTokenVerify.service';
import { SignUpSvc } from './service/signUp.service';
import { SignUpCtrl } from './controller/signUp.controller';
import { SignOutCtrl } from './controller/signOut.controller';
import { SignOutSvc } from './service/signOut.service';

@Module({
  imports: [],
  controllers: [
    LoginCtrl,
    LogoutCtrl,
    RefreshTokenVerifyCtrl,
    SignOutCtrl,
    SignUpCtrl
  ],
  providers: [LoginSvc, LogoutSvc, RefreshTokenVerifySvc, SignOutSvc, SignUpSvc]
})
export class AuthModule {}
