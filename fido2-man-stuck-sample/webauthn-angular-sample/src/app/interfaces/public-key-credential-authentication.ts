export interface PublicKeyCredentialAuthentication extends Credential {
  readonly rawId: ArrayBuffer;
  readonly response: AuthenticatorAssertionResponse;
}
