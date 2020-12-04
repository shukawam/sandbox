import { HttpStatus } from '@nestjs/common';

/**
 * レスポンスに使用するクラス
 */
export class ResponseData {
  /** ステータスコード */
  status: HttpStatus;

  /** メッセージ */
  message?: string;

  /** レスポンスデータ */
  data: any;
}
