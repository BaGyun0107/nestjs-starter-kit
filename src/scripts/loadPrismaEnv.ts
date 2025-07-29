import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const loadPrismaEnv = async () => {
  // 환경 변수 설정
  const env = process.env.NODE_ENV || 'local';
  const envFilePath = path.resolve(process.cwd(), `.env.${env}`);

  if (fs.existsSync(envFilePath)) {
    console.log(`환경변수 ${envFilePath} 파일을 Prisma용으로 로드합니다.`);
    const envVars = dotenv.parse(fs.readFileSync(envFilePath));

    // DATABASE_URL 생성 (Prisma 형식)
    const host = envVars.DATABASE_HOST;
    const port = '3306';
    const database = envVars.DATABASE_NAME;
    const username = envVars.DATABASE_USERNAME;
    const password = envVars.DATABASE_PASSWORD;

    const databaseUrl = `mysql://${username}:${password}@${host}:${port}/${database}`;

    // .env 파일에 DATABASE_URL 추가
    const prismaEnvPath = path.resolve(process.cwd(), `.env`);
    const prismaEnvContent = `DATABASE_URL=${databaseUrl}`;

    fs.writeFileSync(prismaEnvPath, prismaEnvContent);
    console.log(`Prisma용 DATABASE_URL이 .env 파일에 업데이트되었습니다.`);
  } else {
    console.log(`경고: ${envFilePath} 파일을 찾을 수 없습니다.`);
  }
};

loadPrismaEnv();

export default loadPrismaEnv;
