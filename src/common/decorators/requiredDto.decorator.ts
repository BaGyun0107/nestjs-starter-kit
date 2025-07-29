import { applyDecorators } from '@nestjs/common';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidationOptions
} from 'class-validator';
import { StringPattern } from './stringPattern.decorator';
import { ParseBoolean } from './parseBoolean.decorator';

export class RequiredDto {
  /**
   * 필수 문자열 필드를 위한 데코레이터
   * IsString, IsNotEmpty, StringPattern을 함께 적용합니다
   * @param pattern 사용자 정의 정규식 패턴 (Optional)
   */
  static string(pattern?: RegExp, validationOptions?: ValidationOptions) {
    return applyDecorators(
      IsString(),
      IsNotEmpty(),
      StringPattern(pattern, validationOptions)
    );
  }

  /**
   * 필수 불리언 필드를 위한 데코레이터
   * IsBoolean과 IsNotEmpty를 함께 적용합니다
   */
  static boolean(validationOptions?: ValidationOptions) {
    return applyDecorators(
      IsBoolean(),
      IsNotEmpty(),
      ParseBoolean(validationOptions)
    );
  }

  /**
   * 필수 숫자 필드를 위한 데코레이터
   * IsNumber와 IsNotEmpty를 함께 적용합니다
   */
  static number() {
    return applyDecorators(IsNumber(), IsNotEmpty());
  }

  /**
   * 필수 IP 필드를 위한 데코레이터
   * IsString, IsIP, IsNotEmpty를 함께 적용합니다
   */
  static ip() {
    return applyDecorators(IsString(), IsIP(), IsNotEmpty());
  }

  /**
   * 필수 배열 필드를 위한 데코레이터
   * IsArray와 ArrayNotEmpty 함께 적용합니다
   */
  static array() {
    return applyDecorators(IsArray(), ArrayNotEmpty());
  }
}
