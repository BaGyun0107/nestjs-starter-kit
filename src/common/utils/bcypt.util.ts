import * as bcrypt from 'bcrypt';

export class BcryptUtil {
  /**
   * 비밀번호 해시 생성
   * @param password - 비밀번호
   * @param pwdKey - 비밀번호 키
   * @returns 해시된 비밀번호
   */
  static async hash(password: string, pwdKey: string): Promise<string> {
    const saltRounds = 10;
    const combinedPassword = password + pwdKey;
    const hash = await bcrypt.hash(combinedPassword, saltRounds);
    return hash;
  }

  /**
   * 비밀번호 비교
   * @param password - 비밀번호
   * @param hash - 해시된 비밀번호
   * @param pwdKey - 비밀번호 키
   * @returns 비교 결과
   */
  static async compare(
    password: string,
    hash: string,
    pwdKey: string
  ): Promise<boolean> {
    const combinedPassword = password + pwdKey;
    return await bcrypt.compare(combinedPassword, hash);
  }
}
