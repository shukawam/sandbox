/**
 * ユーザの登録情報。
 */
export interface UserCreationOptions {
  /** メールアドレス */
  email?: string;
  /** チャレンジ（ArayBufferをbase64Urlエンコードする） */
  challenge?: string;
  /** 認証サーバ情報 */
  rp?: {
    name: string;
  };
  /** ユーザ情報 */
  user?: {
    id: string;
    name: string;
    displayName: string;
  };
  /** 認証器からの認証情報の取得の仕方 */
  attestation?: 'direct' | 'indirect' | 'none';
}
