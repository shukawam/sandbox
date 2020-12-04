export interface User {
  status: number;
  data: {
    email: string;
    challenge?: string;
    rp?: {
      name: string;
    };
    user?: {
      id: string;
      name: string;
      displayName: string;
    };
    attestation?: AttestationConveyancePreference;
  };
}
