import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

export default () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  // 환경변수가 없으면 로컬 환경으로 설정
  const isLocal = !process.env.NODE_ENV ? true : false;

  let allowedOrigins = [];

  // 정규표현식은, http, https, 서브도메인 허용하기 위해 작성
  if (isDevelopment || isLocal) {
    // 개발 환경
    allowedOrigins = [
      'http://localhost:3000',
      /^https?:\/\/([a-z0-9-]+\.)*{HOST}\.com$/i
    ];
  } else {
    // 배포환경에서는 허용 도메인 설정
    allowedOrigins = [];
  }

  return {
    env: process.env.NODE_ENV || 'local',
    port: parseInt(process.env.PORT, 10) || 8080,
    authkey: process.env.API_AUTH_KEY,
    database: {
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      name: process.env.DATABASE_NAME,
      url: `mysql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT || 3306}/${process.env.DATABASE_NAME}`
    },
    cors: {
      allowedOrigins
    },
    logging: {
      // 개발 환경이나 d운영 환경에서는 로깅을 활성화
      isLogging: isDevelopment || isProduction
    }
  };
};
