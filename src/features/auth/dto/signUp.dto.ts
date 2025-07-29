import { IsNotEmpty, IsString, Length } from 'class-validator';
import { RequiredDto } from 'src/common/decorators/requiredDto.decorator';

export class SignUpDto {
  @RequiredDto.string()
  user_code: string;

  @RequiredDto.string(/^[A-Za-z0-9]+$/, {
    message: '아이디는 영문 대소문자와 숫자만 사용할 수 있습니다.'
  })
  login_id: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20, {
    message: '비밀번호는 8자 이상 20자 이하여야 합니다.'
  })
  password: string;
}
