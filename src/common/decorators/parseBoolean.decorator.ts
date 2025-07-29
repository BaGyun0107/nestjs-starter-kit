import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * 문자열 값을 불리언으로 변환하는 데코레이터
 * 'true', '1', 1 은 true로 변환
 * 'false', '0', 0 은 false로 변환
 * 그 외의 값은 유효성 검사 오류 발생
 * @param validationOptions 유효성 검사 옵션 (Optional)
 */
export function ParseBoolean(validationOptions?: ValidationOptions) {
  // Transform 데코레이터 생성
  const transformFn = Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      if (['true', '1'].includes(value.toLowerCase())) {
        return true;
      }

      if (['false', '0'].includes(value.toLowerCase())) {
        return false;
      }
    }

    if (typeof value === 'number') {
      if (value === 1) {
        return true;
      }

      if (value === 0) {
        return false;
      }
    }

    // 변환할 수 없는 경우 원래 값을 반환 (유효성 검증에서 처리)
    return value;
  });

  // 유효성 검사 데코레이터 생성
  return function (target: object, propertyName: string) {
    // Transform 데코레이터 적용
    transformFn(target, propertyName);

    // class-validator를 사용하여 유효성 검사 로직 구현
    registerDecorator({
      name: 'parseBoolean',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value === 'boolean') {
            return true;
          }

          if (typeof value === 'string') {
            return ['true', 'false', '1', '0'].includes(value.toLowerCase());
          }

          if (typeof value === 'number') {
            return [1, 0].includes(value);
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return (
            (validationOptions?.message as string) ||
            `${args.property}는 불리언 값이어야 합니다. ('true', 'false', '1', '0', 1, 0)`
          );
        }
      }
    });
  };
}
