export interface UserAuthenticationOption {
  challenge: string;
  allowCredentials: [
    {
      type: 'public-key';
      id: string;
      transports: string[];
    }
  ];
}
