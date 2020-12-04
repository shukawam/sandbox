import { IsEmail } from 'class-validator';

/**
 * ユーザ登録に使用するデータオブジェクト。（リクエストボディー）
 */
export class CreateUserDto {
  /** メールアドレス */
  @IsEmail()
  email: string;
}
