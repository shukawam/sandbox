/**
 * ClientDataJSONをデコード後の型
 */
export interface DecodedClientDataJson {
  /** チャレンジ */
  challenge: string;
  /** オリジン */
  origin: string;
  /** タイプ */
  type: 'public-key';
}
