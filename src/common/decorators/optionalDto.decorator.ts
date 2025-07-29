import {
  IsArray,
  IsBoolean,
  IsIP,
  IsNumber,
  IsOptional,
  IsString,
  ValidationOptions
} from 'class-validator';
import { StringPattern } from './stringPattern.decorator';
import { applyDecorators } from '@nestjs/common';
import { ParseBoolean } from './parseBoolean.decorator';
import { ArrayType } from './arrayType.decorator';

export class OptionalDto {
  /**
   * 선택적 문자열 필드를 위한 데코레이터
   * IsString, IsOptional, StringPattern을 함께 적용합니다
   * @param pattern 사용자 정의 정규식 패턴 (Optional)
   */
  static string(pattern?: RegExp, validationOptions?: ValidationOptions) {
    return applyDecorators(
      IsString(),
      IsOptional(),
      StringPattern(pattern, validationOptions)
    );
  }

  /**
   * 선택적 불리언 필드를 위한 데코레이터
   * IsBoolean, IsOptional, ParseBoolean을 함께 적용합니다
   */
  static boolean() {
    return applyDecorators(IsBoolean(), IsOptional(), ParseBoolean());
  }

  /**
   * 선택적 숫자 필드를 위한 데코레이터
   * IsNumber, IsOptional을 함께 적용합니다
   */
  static number() {
    return applyDecorators(IsNumber(), IsOptional());
  }

  /**
   * 선택적 IP 필드를 위한 데코레이터
   * IsString, IsIP, IsOptional을 함께 적용합니다
   */
  static ip() {
    return applyDecorators(IsString(), IsIP(), IsOptional());
  }

  /**
   * 선택적 배열 필드를 위한 데코레이터
   * IsArray, IsOptional을 함께 적용합니다
   */
  static array(type: any, validationOptions?: ValidationOptions) {
    return applyDecorators(
      IsArray(),
      IsOptional(),
      ArrayType(type, validationOptions)
    );
  }
}
