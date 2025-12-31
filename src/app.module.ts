import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  NestModule
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './features/auth/auth.module';
import { LoggerService } from './features/log/service/logger.service';
import { LogModule } from './features/log/log.module';
import { PrismaModule } from './database/prisma.module';
import {
  IpFilterMiddleware,
  IpFilterService
} from './common/middlewares/ip-filter.middleware';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'local'}`,
      load: [configuration]
    }),
    // Rate Limiting 설정 (전역)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return [
          {
            ttl: parseInt(config.get('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 기본 15분
            limit: parseInt(config.get('RATE_LIMIT_MAX_REQUESTS', '100'), 10) // 기본 100회
          }
        ];
      }
    }),
    PrismaModule,
    AuthModule,
    LogModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: LoggerService,
      useFactory: (configService: ConfigService) => {
        return new LoggerService(configService);
      },
      inject: [ConfigService]
    },
    IpFilterService, // IP 필터 서비스 등록
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard // 전역 Rate Limiting 가드 적용
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor // 전역 타임아웃 인터셉터 적용
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // IP 필터 미들웨어 전역 적용
    consumer
      .apply(IpFilterMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
