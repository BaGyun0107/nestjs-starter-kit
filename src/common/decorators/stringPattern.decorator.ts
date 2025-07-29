import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

/**
 * 문자열에 대한 패턴 검증 데코레이터
 * 사용자 정의 패턴을 제공하거나 기본 패턴을 사용할 수 있음
 * @param pattern 사용자 정의 정규식 패턴 (Optional)
 * @param validationOptions 유효성 검사 옵션 (Optional)
 */
export function StringPattern(
  pattern?: RegExp,
  validationOptions?: ValidationOptions
) {
  return function (target: object, propertyName: string) {
    // 기본 패턴 - 한글, 영문, 숫자, 중국어, 일본어, 특수문자 등 포함
    const defaultPattern =
      /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9\u4E00-\u9FFF\u3400-\u4DBF\s.,()[\]_-]*$/u;

    registerDecorator({
      name: 'stringPattern',
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }

          // 사용자 정의 패턴이 있으면 사용, 없으면 기본 패턴 사용
          const patternToUse = pattern || defaultPattern;
          return patternToUse.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return (
            (validationOptions?.message as string) ||
            `${args.property}에 허용되지 않는 문자가 포함되어 있습니다.`
          );
        }
      }
    });
  };
}
