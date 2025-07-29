import { SignUpDto } from '../dto/signUp.dto';
import { provider } from 'prisma/generated/prisma-client-js';

export interface SignUpData extends SignUpDto {
  providerInfo: provider;
}
