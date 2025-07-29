import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { LoggerService } from '../../features/log/service/logger.service';
import { DateUtil } from '../utils/date.util';
import { GetIpUtil } from '../utils/getIp.util';

/**
 * @description 로깅 인터셉터
 * 요청 및 응답 로깅
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logSvc: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 요청
    const req = context.switchToHttp().getRequest<Request>();
    // 응답
    const res = context.switchToHttp().getResponse<Response>();
    // 날짜 및 IP 추출
    const { koreanDate, koreanTime } = DateUtil.krDate();
    const ip = GetIpUtil.getIp(context);

    const { method, url, body, query, params } = req;
    // 유저 에이전트 추출
    const userAgent = req.get('user-agent') || '';
    // 타임스탬프 생성
    const timestamp = `${koreanDate} ${koreanTime}`;

    // 요청 로깅 메시지 생성
    const requestLog = `[${timestamp}] [Request] ${method} ${url} - IP: ${ip} - UserAgent: ${userAgent} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)} - Params: ${JSON.stringify(params)}`;
    // 요청 로깅
    this.logSvc.access(requestLog, 'HttpRequest');

    const now = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        // 응답 시간 계산
        const duration = Date.now() - now;
        // 응답 상태 코드 추출
        const statusCode = res.statusCode;

        // 응답 로깅 메시지 생성
        const responseLog = `[${timestamp}] [Response] ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - Body: ${JSON.stringify(responseBody)}`;
        // 응답 로깅
        this.logSvc.access(responseLog, 'HttpResponse');

        // 응답 로깅 후 응답 전송
        res.status(statusCode).send(responseBody);
        return;
      }),
      catchError((error) => {
        // 응답 시간 계산
        const duration = Date.now() - now;
        // 응답 상태 코드 추출
        const statusCode = error.status || 500;

        // 데이터베이스 오류일 경우 더 자세한 정보 로깅
        if (error.name === 'QueryFailedError') {
          const queryError = error;
          this.logSvc.error(
            `[Database Error] ${method} ${url} - Status: ${statusCode} - Query: ${queryError.message}`,
            `SQL: ${queryError.sql || '알 수 없음'}, 
            매개변수: ${JSON.stringify(queryError.parameters || {})}, 
            드라이버 오류: ${JSON.stringify(queryError.driverError) || '알 수 없음'},
            스택: ${error.stack}`,
            'HttpDatabaseError'
          );
        } else {
          // 일반 오류 로깅 메시지 생성
          const errorLog = `[${timestamp}] [Error] ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - Error: ${error.message || 'Unknown error'}`;
          // 오류 로깅
          this.logSvc.error(errorLog, error.stack, 'HttpInterceptorError');
        }

        // 예외를 마킹하여 필터에서 중복 로깅 방지
        (error as any).__intercepted = true;

        // 오류를 다시 던져서 예외 필터가 처리할 수 있게 함
        return throwError(() => {
          return error;
        });
      })
    );
  }
}
