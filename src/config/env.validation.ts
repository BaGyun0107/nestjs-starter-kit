import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Local = 'local'
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Local;

  @IsNumber()
  @Min(0)
  @IsOptional()
  PORT: number = 8080;

  @IsString()
  @IsOptional()
  API_AUTH_KEY: string;

  @IsString()
  @IsOptional()
  DATABASE_HOST: string;

  @IsNumber()
  @IsOptional()
  DATABASE_PORT: number = 3306;

  @IsString()
  @IsOptional()
  DATABASE_USERNAME: string;

  @IsString()
  @IsOptional()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsOptional()
  DATABASE_NAME: string;

  @IsNumber()
  @IsOptional()
  SLOW_DOWN_DELAY_AFTER: number = 50;

  @IsNumber()
  @IsOptional()
  SLOW_DOWN_MAX_DELAY: number = 5000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS: number = 900000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX_REQUESTS: number = 100;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
