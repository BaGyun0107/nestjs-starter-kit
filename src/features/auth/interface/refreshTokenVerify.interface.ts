import { provider, user } from 'prisma/generated/prisma-client-js';

export interface RefreshTokenData {
  ca_rt: string;
  providerInfo: provider;
}

export interface RefreshTokenVerifyResult {
  user: Partial<user>;
  accessToken: string;
  accessTokenExp: number;
}
