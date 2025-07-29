import { IsNotEmpty, IsString, Length } from 'class-validator';
import { RequiredDto } from 'src/common/decorators/requiredDto.decorator';
import { OptionalDto } from 'src/common/decorators/optionalDto.decorator';

export class LoginDto {
  // 이전 로그인 방식
  @RequiredDto.string()
  login_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20, {
    message: '비밀번호는 8자 이상 20자 이하여야 합니다.'
  })
  password: string;

  @RequiredDto.ip()
  ip: string;

  @OptionalDto.boolean()
  autoLogin?: boolean;
}
