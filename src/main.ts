import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import helmet from 'helmet';
import * as hpp from 'hpp';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { slowDown } from 'express-slow-down';
import { LoggerService } from './features/log/service/logger.service';
import { AllExceptionsFilter } from './common/filters/httpException.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuthorizeGuard } from './common/guards/authorize.guard';
import loadPrismaEnv from './scripts/loadPrismaEnv';

dayjs.extend(utc);
dayjs.extend(timezone);

// UTC -> 한국시간으로 변환 (전역 설정)
Date.prototype.toJSON = function () {
  return dayjs(this).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
};

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
  logSvc.log(
    `${signal} 시그널 수신, 애플리케이션 종료 중... (PID: ${process.pid})`,
    'Shutdown'
  );

  // 강제 종료 타이머 설정 (7초)
  const forceExitTimer = setTimeout(() => {
    logSvc.fatal('서버 종료 타임아웃 - 강제 종료 진행', undefined, 'Shutdown');
    process.exit(1);
  }, 7000);

  try {
    await app.close();
    clearTimeout(forceExitTimer);
    logSvc.log('애플리케이션이 정상적으로 종료되었습니다.', 'Shutdown');
    process.exit(0);
  } catch (error) {
    clearTimeout(forceExitTimer);
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

  // Morgan 로깅 설정 (Winston Stream 연결)
  const env = configService.get('env');
  if (env !== 'test') {
    app.use(
      morgan('combined', {
        stream: logSvc.getStream()
      })
    );
  }

  // 보안 미들웨어 설정

  // 1. Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      frameguard: false // iframe 허용
    })
  );

  // 2. HPP (HTTP Parameter Pollution)
  app.use(hpp());

  // 3. Slow Down (DDoS 방어 - 점진적 지연)
  app.use(
    slowDown({
      windowMs: 15 * 60 * 1000, // 15분
      delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER, 10) || 50, // 50 요청 후 지연 시작
      delayMs: (hits) => {
        return hits * 100;
      }, // 요청마다 100ms씩 증가
      maxDelayMs: parseInt(process.env.SLOW_DOWN_MAX_DELAY, 10) || 5000 // 최대 5초
    })
  );

  // 전역 가드 설정
  app.useGlobalGuards(new AuthorizeGuard(configService));

  // 전역 예외 처리 필터 설정
  app.useGlobalFilters(new AllExceptionsFilter(logSvc));

  // 전역 로깅 인터셉터 설정 (상세 바디 로깅이 필요한 경우 유지)
  app.useGlobalInterceptors(new LoggingInterceptor(logSvc));

  app.enableCors({
    origin: configService.get('cors.allowedOrigins'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Access-Token',
      'X-Refresh-Token'
    ],
    exposedHeaders: [
      'content-disposition',
      'X-Access-Token',
      'X-Refresh-Token'
    ],
    credentials: true
  });

  // Graceful Shutdown 활성화
  // app.enableShutdownHooks();

  const port = configService.get('port');

  await app.listen(port);
  logSvc.log(`PORT:${port} 서버 정상 작동`, 'Bootstrap');

  // 시그널 처리 (NestJS enableShutdownHooks가 있지만, 명시적으로 로거를 쓰고 싶은 경우 유지)
  process.on('SIGTERM', () => {
    return gracefulShutdown(app, logSvc, 'SIGTERM');
  });
  process.on('SIGINT', () => {
    return gracefulShutdown(app, logSvc, 'SIGINT');
  });

  // 예외 처리
  process.on('uncaughtException', (error) => {
    logSvc.fatal('처리되지 않은 예외', error, 'Bootstrap');
    // 운영 환경에서는 잠시 후 종료
    if (configService.get('env') === 'production') {
      setTimeout(() => {
        return process.exit(1);
      }, 1000);
    } else {
      process.exit(1);
    }
  });

  // 처리되지 않은 프로미스 거부
  process.on('unhandledRejection', (reason) => {
    logSvc.fatal(
      `처리되지 않은 프로미스 거부: ${reason}`,
      undefined,
      'Bootstrap'
    );
    // 운영 환경에서는 잠시 후 종료
    if (configService.get('env') === 'production') {
      setTimeout(() => {
        return process.exit(1);
      }, 1000);
    } else {
      process.exit(1);
    }
  });
}

bootstrap();
