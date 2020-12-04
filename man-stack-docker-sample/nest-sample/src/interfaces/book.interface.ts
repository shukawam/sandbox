import { Document } from 'mongoose';

export interface Book extends Document {
  name: string;
  author: string;
  remarks: string;
}
