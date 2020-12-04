import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  email: String,
  challenge: String,
  rp: {
    name: String,
  },
  user: {
    id: String,
    name: String,
    displayName: String,
  },
  attestation: String,
  id: String,
  authInfo: {
    fmt: String,
    publicKey: String,
    counter: Number,
    credId: String,
  },
});
