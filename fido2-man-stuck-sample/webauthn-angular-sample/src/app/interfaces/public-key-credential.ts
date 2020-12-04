export interface PublicKeyCredential extends Credential {
  readonly rawId: ArrayBuffer;
  readonly response: AuthenticatorAttestationResponse;
}
