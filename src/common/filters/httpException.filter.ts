import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { LoggerService } from 'src/features/log/service/logger.service';

/**
 * 모든 예외를 처리하는 필터
 *
 * @description 모든 예외를 처리하는 필터
 * @param {unknown} exception - 예외
 * @param {ArgumentsHost} host - 인자 호스트
 * @returns {void}
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logSvc: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 이미 응답이 전송되었는지 확인
    if (response.headersSent) {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const trace = exception instanceof Error ? exception.stack : undefined;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // 로그는 이미 인터셉터에서 기록되지만, 기록되지 않은 경우 로깅
    if (!(exception as any).__intercepted) {
      // 데이터베이스 오류에 대한 자세한 정보 로깅
      if (exception instanceof Error && exception.name === 'QueryFailedError') {
        const queryError = exception as any;
        this.logSvc.error(
          `데이터베이스 오류: ${queryError.message}`,
          `SQL: ${queryError.sql || '알 수 없음'}, 
        매개변수: ${JSON.stringify(queryError.parameters || {})}, 
        드라이버 오류: ${queryError.driverError?.message || '알 수 없음'}`,
          'DatabaseError'
        );
      }

      this.logSvc.error(
        typeof message === 'object' ? JSON.stringify(message) : message,
        trace,
        'AllExceptionsFilter'
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message
    });
  }
}
