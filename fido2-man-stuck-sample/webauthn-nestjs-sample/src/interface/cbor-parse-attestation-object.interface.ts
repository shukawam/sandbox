/**
 * AttestationOBjectをCBORパースして得られるInterface
 */
export interface CborParseAttestationObject {
  fmt: string;
  attStmt: {
    sig: Buffer;
    x5c: Buffer[];
  };
  authData: Buffer;
}
