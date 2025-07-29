import * as jwt from 'jsonwebtoken';

/**
 * 문자열 형식의 시간 ('1d', '5h', '30m', '10s')을 초 단위 숫자로 변환
 * @param {string | number} value
 * @returns {number} 초 단위 숫자
 */
const parseExpiresInToSeconds = (value: string | number): number => {
  if (typeof value === 'number') return value;

  const match = /^(\d+)([dhms])$/.exec(value);
  if (!match) {
    throw new Error(`Invalid expiresIn format: ${value}`);
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2];

  const unitMap = {
    d: 86400,
    h: 3600,
    m: 60,
    s: 1
  };

  return amount * unitMap[unit as keyof typeof unitMap];
};

/**
 * @description 토큰 생성 유틸리티
 */
export class GenerateTokenUtil {
  /**
   * @param {any} data - 토큰에 포함할 데이터
   * @param {string} key - 토큰 키
   * @param {object} options - 토큰 생성 옵션
   * @param {string | number} options.expiresIn - 토큰 만료 시간
   * @param {string} options.issuer - 토큰 발급자
   * @param {string} options.subject - 토큰 주제
   * @param {string} options.notBefore - 토큰 시작 시간
   * @returns {{ token: string, exp: number }} - 생성된 액세스 토큰과 만료 시간
   * @description 액세스 토큰 생성
   */
  static generateAccessToken(
    data: any,
    key: string,
    options?: {
      expiresIn?: string | number;
      issuer?: string;
      subject?: string;
      notBefore?: string;
    }
  ): { token: string; exp: number } {
    const rawExpiresIn = options?.expiresIn ?? '1h';

    const token = jwt.sign(data, key, {
      expiresIn: rawExpiresIn,
      issuer: options?.issuer || 'codi_account',
      subject: options?.subject || data.login_id,
      notBefore: options?.notBefore || '0s'
    });

    // 토큰 만료 시간(초) 변환
    const expiresIn = parseExpiresInToSeconds(rawExpiresIn);

    // 현재 시간(초)에 3600초(1시간) 추가
    const exp = Math.floor(Date.now() / 1000) + expiresIn;

    return { token, exp };
  }

  /**
   * @param {any} data - 토큰에 포함할 데이터
   * @param {string} key - 토큰 키
   * @param {boolean} autoLogin - 자동 로그인 여부
   * @param {object} options - 토큰 생성 옵션
   * @param {string | number} options.expiresIn - 토큰 만료 시간
   * @param {string} options.issuer - 토큰 발급자
   * @param {string} options.subject - 토큰 주제
   * @param {string} options.notBefore - 토큰 시작 시간
   * @returns {{ token: string, exp: number }} - 생성된 리프레시 토큰과 만료 시간
   * @description 리프레시 토큰 생성
   */
  static generateRefreshToken(
    data: any,
    key: string,
    autoLogin: boolean,
    options?: {
      expiresIn?: string | number;
      issuer?: string;
      subject?: string;
      notBefore?: string;
    }
  ): { token: string; exp: number } {
    const rawExpiresIn = options?.expiresIn ?? (autoLogin ? '365d' : '1d');

    const token = jwt.sign(data, key, {
      expiresIn: rawExpiresIn,
      issuer: options?.issuer || 'codi_account',
      subject: options?.subject || data.login_id,
      notBefore: options?.notBefore || '0s'
    });

    // 토큰 만료 시간(초) 변환
    const expiresIn = parseExpiresInToSeconds(rawExpiresIn);

    // 현재 시간(초)에 만료 시간 추가
    const exp = Math.floor(Date.now() / 1000) + expiresIn;

    return { token, exp };
  }
}
