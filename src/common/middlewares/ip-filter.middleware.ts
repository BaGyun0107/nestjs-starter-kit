import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpFilterService {
  private blacklist = new Set<string>();
  private failureCount = new Map<string, number>();

  constructor(private readonly configService: ConfigService) {}

  isWhitelisted(ip: string): boolean {
    const whitelistEnv = this.configService.get<string>('IP_WHITELIST', '');
    const whitelist = whitelistEnv.split(',').map((item) => {
      return item.trim();
    });
    return whitelist.includes(ip) || ip === '::1' || ip === '127.0.0.1';
  }

  isBlacklisted(ip: string): boolean {
    return this.blacklist.has(ip);
  }

  addToBlacklist(ip: string, duration = 0) {
    if (this.isWhitelisted(ip)) return;

    console.warn(
      `[IP Filter] Adding ${ip} to blacklist${duration ? ` for ${duration}ms` : ' permanently'}`
    );
    this.blacklist.add(ip);

    if (duration > 0) {
      setTimeout(() => {
        this.blacklist.delete(ip);
        console.info(`[IP Filter] Removed ${ip} from blacklist after timeout`);
      }, duration);
    }
  }

  recordFailure(ip: string) {
    const count = (this.failureCount.get(ip) || 0) + 1;
    this.failureCount.set(ip, count);

    const threshold = parseInt(
      this.configService.get('AUTO_BAN_THRESHOLD', '10'),
      10
    );
    const banDuration = parseInt(
      this.configService.get('AUTO_BAN_DURATION', '3600000'),
      10
    );

    if (count >= threshold) {
      this.addToBlacklist(ip, banDuration);
      this.failureCount.delete(ip);
      console.warn(
        `[IP Filter] IP ${ip} auto-banned after ${count} failures for ${banDuration}ms`
      );
    }
  }
}

@Injectable()
export class IpFilterMiddleware implements NestMiddleware {
  constructor(private readonly ipFilterService: IpFilterService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const ip = (req.ip || req.connection.remoteAddress || '').replace(
      '::ffff:',
      ''
    );

    // Whitelist 통과
    if (this.ipFilterService.isWhitelisted(ip)) {
      return next();
    }

    // Blacklist 차단
    if (this.ipFilterService.isBlacklisted(ip)) {
      console.warn(`[IP Filter] Blocked request from blacklisted IP: ${ip}`);
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        status: HttpStatus.FORBIDDEN,
        message: '접근이 차단되었습니다.'
      });
    }

    return next();
  }
}
