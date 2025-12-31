import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeoutValue = parseInt(
      this.configService.get('REQUEST_TIMEOUT', '30000'),
      10
    ); // 기본 30초

    return next.handle().pipe(
      timeout(timeoutValue),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => {
            return new RequestTimeoutException('요청 시간이 초과되었습니다.');
          });
        }
        return throwError(() => {
          return err;
        });
      })
    );
  }
}
