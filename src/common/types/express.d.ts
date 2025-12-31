import 'express';

declare module 'express' {
  interface Request {
    user?: any; // AuthMiddleware에서 설정
    providerInfo?: any;
  }
}
