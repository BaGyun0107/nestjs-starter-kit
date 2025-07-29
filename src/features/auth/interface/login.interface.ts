import { LoginDto } from '../dto/login.dto';
import { provider, user } from 'prisma/generated/prisma-client-js';

export interface LoginData extends LoginDto {
  providerInfo: Partial<provider>;
}

export interface LoginResult {
  user: Partial<user>;
  accessToken: string;
  refreshToken: string;
  accessTokenExp: number;
  refreshTokenExp: number;
}
