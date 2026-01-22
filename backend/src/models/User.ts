import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  name?: string;
  image?: string;
  provider?: string;
  plan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    image: { type: String },
    provider: { type: String },
    plan: {
      type: String,
      enum: ['FREE', 'STARTER', 'GROWTH', 'ENTERPRISE'],
      default: 'FREE',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
