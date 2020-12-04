export interface VerifiedAuthenticatorAttestationResponse {
  verified: boolean;
  authInfo?: {
    fmt: string;
    publicKey: string;
    counter: number;
    credId: string;
  };
}
