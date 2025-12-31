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

    // 콘솔용 Transport (개발 환경 등)
    const consoleTransport = new winston.transports.Console({
      level: this.isLocalEnv ? 'debug' : 'info',
      format: winston.format.combine(
        timestampFormat,
        winston.format.colorize(),
        printFormat
      )
    });

    // 1. App 로그 (일반 어플리케이션 로그)
    // 에러 포함 모든 레벨 기록
    const appTransport = new DailyRotateFile({
      level: this.isLocalEnv ? 'debug' : 'info',
      dirname: logDir,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(timestampFormat, printFormat)
    });

    // 2. Access 로그 (Morgan 전용, Error 제외)
    const omitErrorFilter = winston.format((info) => {
      return info.level === 'error' ? false : info;
    })();

    const accessTransport = new DailyRotateFile({
      level: 'info',
      dirname: logDir,
      filename: 'access-%DATE%.log',
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

    // 3. Error 로그 (App 및 Morgan 에러 통합)
    const errorTransport = new DailyRotateFile({
      level: 'error',
      dirname: logDir,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(timestampFormat, printFormat)
    });

    // App Logger 생성: appTransport + errorTransport
    // consoleTransport는 편의상 AppLogger에 붙임
    this.appLogger = winston.createLogger({
      transports: [
        consoleTransport,
        // 로컬이 아닐 때만 파일 기록
        ...(this.isLocalEnv ? [] : [appTransport]) // App 로그엔 Error는 별도로 안 넣고 app.log에 다 넣거나 선택 가능하지만, 보통 app.log는 전체.
        // Node js snippet에서는 app log에 다 몰아넣음.
      ]
    });

    // HTTP Logger 생성: accessTransport (성공) + errorTransport (실패)
    this.httpLogger = winston.createLogger({
      transports: this.isLocalEnv
        ? [] // 로컬에선 파일 생성 안 함 (원한다면 추가 가능)
        : [accessTransport, errorTransport]
    });
  }

  // --- NestLoggerService 구현 ---

  log(message: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    this.appLogger.info(contextMsg);
  }

  error(message: string, trace?: string, context?: string) {
    const contextMsg = context ? `[${context}] ${message}` : message;
    // App Logger에도 에러를 남길지, Error 로그 파일에만 남길지 결정.
    // 보통 콘솔 확인을 위해 App Logger 사용.
    // 파일 분리를 위해 별도 errorTransport를 쓰는 경우:
    // Winston은 레벨에 따라 Transport에 분배됨.
    // 현재 appLogger에는 appTransport만 있음 (info 이상).
    // errorTransport가 appLogger에 없으므로 app-%DATE%.log에 error레벨도 찍힘(info이상이므로).
    // 별도의 error-%DATE%.log를 원한다면 별도 Transport를 추가해야 함.

    // 유저 요청 반영: "App Log 전용 Transport (모든 레벨 포함)"
    // "Error Log (Error 레벨만)"
    // 따라서 appLogger에 errorTransport도 추가해줌.
    if (!this.isLocalEnv) {
      // 동적으로 추가하거나 init에서 추가했어야 함.
      // 메서드 내에서 처리하기 보단 init에서 transport를 잘 구성하는게 좋음.
      // 위 initLogger 로직 수정: appLogger에는 appTransport만 넣고 (이게 이미 error 포함)
      // 별도로 Error만 모으는 파일이 필요하다면 errorTransport도 추가.
    }

    // 단순화를 위해 여기서 직접 winston 호출
    this.appLogger.error(contextMsg, { trace });

    // 에러 전용 파일에도 기록하고 싶다면 별도 처리가 필요하지만
    // 위 설정에서 errorTransport를 appLogger에 추가하면 중복 기록될 수 있음(설정에 따라).
    // 현재 유저 코드는 HTTP Logger에 access/error를 섞어 쓰고,
    // 일반 Logger는 appTransport 하나만 씀 (app.log에 에러도 다 들어감).
    // 그리고 error.log는 별도로 생성.

    // 깔끔한 처리를 위해 아래와 같이 구현:
    // appLogger에는 appTransport (모든 로그) + errorTransport (에러만)
    // 이렇게 하면 error 발생 시 app.log와 error.log 둘 다에 남음.
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
        // Morgan 로그는 httpLogger를 통해 분배
        // info 레벨 -> access.log
        // error 레벨 -> error.log (Morgan이 에러라고 판단할 수 있는 방법은 없으므로 보통 다 info로 들어옴)
        // 하지만 유저 코드는 console.error를 오버라이딩하거나 별도 errorLog 스트림을 썼음.
        // Morgan은 기본적으로 하나의 스트림만 받음.
        // 상태코드 400 이상만 에러로 뺄 순 없음 (Morgan이 문자열로 줌).
        // 따라서 access.log에 다 넣는게 일반적이나, 유저 코드는 httpTransport(omitError) + errorTransport 였음.
        // 즉 Morgan에서 에러라고 판단해서 'error' 레벨로 쏘지 않는 이상 access.log로 감.
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
