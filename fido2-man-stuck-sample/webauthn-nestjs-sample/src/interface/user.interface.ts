import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  challenge: string;
  rp: {
    name: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  attestation: 'direct' | 'indirect' | 'none';
  id?: string;
  authInfo?: {
    fmt: string;
    publicKey: string;
    counter: number;
    credId: string;
  };
}
