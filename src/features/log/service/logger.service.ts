import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as schedule from 'node-schedule';
import { isMainThread } from 'worker_threads';
import { DateUtil } from '../../../common/utils/date.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService {
  private static errorLogStream: fs.WriteStream;
  private static accessLogStream: fs.WriteStream;
  private static isInitialized = false;
  private isLocalEnv: boolean;
  private readonly nestLogger: Logger;

  constructor(private readonly configService?: ConfigService) {
    this.isLocalEnv = this.configService?.get('env') === 'local';
    this.nestLogger = new Logger('LoggerService');

    if (!LoggerService.isInitialized && !this.isLocalEnv) {
      this.initLogStreams();
      this.setupScheduler();
      LoggerService.isInitialized = true;
    }
  }

  // 인스턴스 ID 가져오기 (클러스터 환경 지원)
  private getInstanceId(): string {
    if (isMainThread) {
      return 'master';
    }
    const workerId = process.pid;
    return `worker-${workerId}`;
  }

  // 로그 디렉토리 생성
  private createLogDirectory(date: string): string {
    const instanceId = this.getInstanceId();
    const logDir = path.join(
      process.cwd(),
      'logs',
      date,
      `instance_${instanceId}`
    );

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    return logDir;
  }

  // 로그 파일 경로 업데이트
  private updateLogFiles(date: string) {
    const logDir = this.createLogDirectory(date);
    const errorLogPath = path.join(logDir, `error_${date}.log`);
    const accessLogPath = path.join(logDir, `access_${date}.log`);

    return { errorLogPath, accessLogPath };
  }

  // 새 로그 스트림 열기
  private openNewLogStreams() {
    const { koreanDate } = DateUtil.krDate();
    const { errorLogPath, accessLogPath } = this.updateLogFiles(koreanDate);

    // 기존 스트림 닫기
    if (LoggerService.errorLogStream) {
      LoggerService.errorLogStream.end();
    }
    if (LoggerService.accessLogStream) {
      LoggerService.accessLogStream.end();
    }

    // 새 스트림 생성
    LoggerService.errorLogStream = fs.createWriteStream(errorLogPath, {
      flags: 'a'
    });
    LoggerService.errorLogStream.on('error', (err) => {
      console.error('에러 로그 스트림 생성 오류:', err);
    });

    LoggerService.accessLogStream = fs.createWriteStream(accessLogPath, {
      flags: 'a'
    });
    LoggerService.accessLogStream.on('error', (err) => {
      console.error('접근 로그 스트림 생성 오류:', err);
    });

    this.nestLogger.log(`로그 파일 갱신: ${errorLogPath}, ${accessLogPath}`);
  }

  // 로그 스트림 초기화
  private initLogStreams() {
    if (this.isLocalEnv) return; // local 환경에서는 파일 로깅 초기화 생략
    this.openNewLogStreams();
  }

  // 자정마다 새 로그 파일 생성 스케줄러
  private setupScheduler() {
    if (this.isLocalEnv) return; // local 환경에서는 스케줄러 생략

    schedule.scheduleJob('0 0 * * * *', () => {
      this.nestLogger.log('새 로그 파일 생성 중...');
      this.openNewLogStreams();
    });
  }

  // 접근 로그 작성
  access(message: string, context?: string) {
    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.log(`[ACCESS] ${message}`);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv && LoggerService.accessLogStream) {
      const contextStr = context ? `[${context}] ` : '';
      LoggerService.accessLogStream.write(`${contextStr}${message}\n`);
    }
  }

  /**
   * 에러 로그 작성
   *
   * @param message {string|object} - 로그 메시지
   * @param trace {string} - 예외 스택 트레이스
   * @param context {string} - 컨텍스트
   */
  error(message: string | object, trace?: string, context?: string) {
    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.error(message, trace);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv && LoggerService.errorLogStream) {
      const contextStr = context ? `[${context}] ` : '';
      const traceStr = trace ? ` - ${trace}` : '';
      LoggerService.errorLogStream.write(
        `${contextStr}${message}${traceStr}\n`
      );
    }
  }

  // 일반 로그 (콘솔 + 파일)
  log(message: string, context?: string) {
    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.log(message);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv) {
      this.access(`[INFO] ${message}`, context);
    }
  }

  // 경고 로그
  warn(message: string, context?: string) {
    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.warn(message);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv) {
      this.error(`[WARN] ${message}`, undefined, context);
    }
  }

  // 디버그 로그
  debug(message: string, context?: string) {
    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.debug(message);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv) {
      this.access(`[DEBUG] ${message}`, context);
    }
  }

  // 상세 로그
  verbose(message: string, context?: string) {
    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.verbose(message);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv) {
      this.access(`[VERBOSE] ${message}`, context);
    }
  }

  // 심각한 에러 로그
  fatal(message: string, error?: Error, context?: string) {
    const errorMessage = error ? `${message}: ${error.stack}` : message;

    // 항상 NestJS 로거를 통해 출력 (콘솔)
    const logger = context ? new Logger(context) : this.nestLogger;
    logger.error(`[FATAL] ${errorMessage}`);

    // 로컬 환경이 아닐 경우 파일에도 기록
    if (!this.isLocalEnv) {
      this.error(`[FATAL] ${errorMessage}`, undefined, context);
    }
  }
}
