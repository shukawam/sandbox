/**
 * 認証器で生成された認証情報用のデータオブジェクト（ユーザ認証用）
 */
export class AuthenticationCredentialDto {
  rawId: string;
  response: {
    authenticatorData: string;
    signature: string;
    clientDataJSON: string;
  };
  id: string;
  type: string;
}
