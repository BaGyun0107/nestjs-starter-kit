import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

/**
 * @description Winston 기반 로거 서비스 (Access / App / Error 분리)
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private appLogger: winston.Logger;
  private httpLogger: winston.Logger;
  private isLocalEnv: boolean;

  constructor(private readonly configService: ConfigService) {
    this.isLocalEnv = this.configService.get('env') === 'local';
    this.initLogger();
  }

  private initLogger() {
    const logDir = path.join(process.cwd(), 'logs');

    // 기본 출력 포맷
    const printFormat = winston.format.printf(
      ({ level, message, timestamp }) => {
        // JSON 객체인 경우 문자열로 변환 (필요시)
        const msg =
          typeof message === 'object' ? JSON.stringify(message) : message;
        return `${timestamp} [${level.toUpperCase()}]: ${msg}`;
      }
    );

    const timestampFormat = winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    });

    // Error 레벨 제외 필터
    const omitErrorFilter = winston.format((info) => {
      return info.level === 'error' ? false : info;
    })();

    // 콘솔용 Transport (개발 환경 등)
    const consoleTransport = new winston.transports.Console({
      level: this.isLocalEnv ? 'debug' : 'info',
      format: winston.format.combine(
        timestampFormat,
        winston.format.colorize(),
        printFormat
      )
    });

    // 1. App 로그 (일반 어플리케이션 로그, Error 제외)
    const appTransport = new DailyRotateFile({
      level: this.isLocalEnv ? 'debug' : 'info',
      auditFile: `${logDir}/.audit/app-audit.json`,
      filename: `${logDir}/%DATE%/app.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        omitErrorFilter,
        timestampFormat,
        printFormat
      )
    });

    // 2. Access 로그 (Morgan 전용, Error 제외)
    const accessTransport = new DailyRotateFile({
      level: 'info',
      auditFile: `${logDir}/.audit/access-audit.json`,
      filename: `${logDir}/%DATE%/access.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      // Access 로그는 메시지만 깔끔하게 출력 (Morgan이 포맷팅함)
      format: winston.format.combine(
        omitErrorFilter,
        winston.format.printf(({ message }) => {
          return message as string;
        })
      )
    });

    // 3. Error 로그 (Error 레벨만)
    const errorTransport = new DailyRotateFile({
      level: 'error',
      auditFile: `${logDir}/.audit/error-audit.json`,
      filename: `${logDir}/%DATE%/error.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(timestampFormat, printFormat)
    });

    // App Logger 생성: appTransport (error 제외) + errorTransport (error만)
    this.appLogger = winston.createLogger({
      transports: [
        consoleTransport,
        // 로컬이 아닐 때만 파일 기록
        ...(this.isLocalEnv ? [] : [appTransport, errorTransport])
      ]
    });

    // HTTP Logger 생성: accessTransport (성공) + errorTransport (실패)
    this.httpLogger = winston.createLogger({
      transports: this.isLocalEnv
        ? [] // 로컬에선 파일 생성 안 함 (원한다면 추가 가능)
        : [accessTransport, errorTransport]
    });
  }

  log(message: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    this.appLogger.info(contextMsg);
  }

  error(message: string, trace?: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    // appLogger에 errorTransport가 포함되어 있으므로
    // error 레벨 로그는 error.log에만 기록되고 app.log에는 기록되지 않음 (omitErrorFilter 적용)
    this.appLogger.error(contextMsg, { trace });
  }

  warn(message: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    this.appLogger.warn(contextMsg);
  }

  debug(message: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    this.appLogger.debug(contextMsg);
  }

  verbose(message: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    this.appLogger.verbose(contextMsg);
  }

  fatal(message: string, error?: Error, context?: string) {
    const contextMsg = context
      ? `[${context}] [FATAL] ${message}`
      : `[FATAL] ${message}`;
    this.appLogger.error(contextMsg, { stack: error?.stack });
  }

  /**
   * Morgan Stream
   */
  getStream() {
    return {
      write: (message: string) => {
        this.httpLogger.info(message.trim());
      }
    };
  }

  /**
   * 기존 LoggingInterceptor 용 (필요시 유지)
   */
  access(message: string, context?: string) {
    if (context === 'HttpRequest' || context === 'HttpResponse') {
      // Morgan 사용으로 중복 로깅 방지 (아무것도 안 함)
      return;
    } else {
      this.appLogger.info(message);
    }
  }
}
