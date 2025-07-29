import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  validate
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * 배열 요소의 타입을 지정하고 검증하는 데코레이터
 * @param type 배열 요소의 타입 (클래스)
 * @param validationOptions 검증 옵션
 */
export function ArrayType(type: any, validationOptions?: ValidationOptions) {
  return function (target: object, propertyName: string) {
    registerDecorator({
      name: 'arrayType',
      target: target.constructor,
      propertyName: propertyName,
      constraints: [type],
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value)) {
            return false;
          }

          const [TypeClass] = args.constraints;

          // 기본 타입들 (string, number, boolean)에 대한 처리
          if (TypeClass === String) {
            return value.every((item) => {
              return typeof item === 'string';
            });
          }
          if (TypeClass === Number) {
            return value.every((item) => {
              return typeof item === 'number';
            });
          }
          if (TypeClass === Boolean) {
            return value.every((item) => {
              return typeof item === 'boolean';
            });
          }

          // 클래스 타입에 대한 처리
          try {
            for (const item of value) {
              if (typeof item !== 'object' || item === null) {
                return false;
              }
              const transformedItem = plainToInstance(TypeClass, item);
              const errors = await validate(transformedItem);
              if (errors.length > 0) {
                return false;
              }
            }
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const [TypeClass] = args.constraints;
          return (
            (validationOptions?.message as string) ||
            `${args.property}의 각 요소는 ${TypeClass.name || TypeClass} 타입이어야 합니다.`
          );
        }
      }
    });
  };
}
