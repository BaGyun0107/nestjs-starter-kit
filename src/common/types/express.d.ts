import { provider } from 'prisma/generated/prisma-client-js';

// 전역 네임스페이스에 Express 요청 인터페이스 확장
// 프로바이더 정보를 요청 객체에 추가
declare global {
  namespace Express {
    interface Request {
      providerInfo: provider;
    }
  }
}
