import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { LoggerService } from './features/log/service/logger.service';
import { AllExceptionsFilter } from './common/filters/httpException.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthorizeGuard } from './common/guards/authorize.guard';
import loadPrismaEnv from './scripts/loadPrismaEnv';

/**
 * @description 애플리케이션 정상 종료 처리
 * @param {INestApplication} app - 애플리케이션
 * @param {LoggerService} logSvc - 로그 서비스
 * @param {string} signal - 시그널
 */
async function gracefulShutdown(
  app: INestApplication,
  logSvc: LoggerService,
  signal: string
) {
  logSvc.log(`${signal} 시그널 수신, 애플리케이션 종료 중...`, 'Shutdown');

  try {
    await app.close();
    logSvc.log('애플리케이션이 정상적으로 종료되었습니다.', 'Shutdown');
    process.exit(0);
  } catch (error) {
    logSvc.fatal('애플리케이션 종료 중 오류 발생', error, 'Shutdown');
    process.exit(1);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logSvc = app.get(LoggerService);

  // Prisma 환경 변수 로드
  await loadPrismaEnv();

  // 글로벌 접두사 설정
  app.setGlobalPrefix('api', {
    exclude: [] // 제외할 경로 패턴 (필요시 추가)
  });

  // 글로벌 파이프 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 허용되지 않은 속성이 있으면 요청 거부
      transform: true // 요청 데이터 타입 변환
    })
  );

  app.use(cookieParser());
  // 보안 미들웨어 설정
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      frameguard: false // iframe 허용
    })
  );

  // 전역 가드 설정
  app.useGlobalGuards(new AuthorizeGuard(configService));

  // 전역 예외 처리 필터 설정
  app.useGlobalFilters(new AllExceptionsFilter(logSvc));

  // 전역 로깅 인터셉터 설정
  app.useGlobalInterceptors(new LoggingInterceptor(logSvc));

  app.enableCors({
    origin: configService.get('cors.allowedOrigins'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // 허용된 헤더
    exposedHeaders: [''],
    credentials: true
  });

  const port = configService.get('port');

  await app.listen(port);
  logSvc.log(`PORT:${port} 서버 정상 작동`, 'Bootstrap');

  // 시그널 처리
  process.on('SIGTERM', () => {
    return gracefulShutdown(app, logSvc, 'SIGTERM');
  });
  process.on('SIGINT', () => {
    return gracefulShutdown(app, logSvc, 'SIGINT');
  });

  // 예외 처리
  process.on('uncaughtException', (error) => {
    logSvc.fatal('처리되지 않은 예외', error, 'Bootstrap');
    process.exit(1);
  });

  // 처리되지 않은 프로미스 거부
  process.on('unhandledRejection', (reason) => {
    logSvc.fatal(
      `처리되지 않은 프로미스 거부: ${reason}`,
      undefined,
      'Bootstrap'
    );
    process.exit(1);
  });
}

bootstrap();
