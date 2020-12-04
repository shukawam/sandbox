export interface AuthUser {
  status: number;
  data: {
    challenge?: string;
    allowCredentials?: [
      {
        type: 'public-key';
        id: string;
        transports?: AuthenticatorTransport[];
      }
    ];
  };
}
