import { IsEmail } from 'class-validator';

/**
 * ユーザの認証に使用するデータオブジェクト。（リクエストボディー）
 */
export class LoginUserDto {
  /** メールアドレス */
  @IsEmail()
  email: string;
}
