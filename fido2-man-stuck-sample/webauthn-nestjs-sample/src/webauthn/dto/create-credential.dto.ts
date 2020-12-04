/**
 * 認証器で生成された認証情報用のデータオブジェクト（リクエストボディー）
 */
export class CreateCredentialDto {
  rawId: string;
  response: {
    attestationObject: string;
    clientDataJSON: string;
  };
  id: string;
  type: string;
}
