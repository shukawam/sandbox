/**
 * AuthDataをCBORパースして得られるインタフェース
 */
export interface CborParseAuthData {
  rpIdHash: Buffer;
  flagsBuf: Buffer;
  flags: number;
  counter: number;
  counterBuf: Buffer;
  aaguid: Buffer;
  credID: Buffer;
  cosePublicKey: Buffer;
}
