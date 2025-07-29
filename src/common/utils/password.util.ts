import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  /**
   * 비밀번호 암호화
   * @param password {string} 비밀번호
   * @param pwdKey {string} 비밀번호 키
   * @returns {Promise<string>} 암호화된 비밀번호
   */
  static async hashPassword(password: string, pwdKey: string): Promise<string> {
    const saltRounds = 10;
    const combinedPassword = password + pwdKey; // pwdKey와 비밀번호를 결합
    const hash = await bcrypt.hash(combinedPassword, saltRounds);
    return hash;
  }

  /**
   * 비밀번호 검증
   * @param inputPassword {string} 입력된 비밀번호
   * @param storedHash {string} 저장된 비밀번호
   * @param pwdKey {string} 비밀번호 키
   * @returns {Promise<boolean>} 검증 결과
   */
  static async verifyPassword(
    inputPassword: string,
    storedHash: string,
    pwdKey: string
  ): Promise<boolean> {
    const combinedPassword = inputPassword + pwdKey; // pwdKey와 입력된 비밀번호를 결합
    const isMatch = await bcrypt.compare(combinedPassword, storedHash);
    return isMatch;
  }
}
