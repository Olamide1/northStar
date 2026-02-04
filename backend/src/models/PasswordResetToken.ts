import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for faster token lookups and automatic cleanup
PasswordResetTokenSchema.index({ token: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired tokens
PasswordResetTokenSchema.index({ userId: 1, used: 1 });

/**
 * Generate a secure random token
 */
PasswordResetTokenSchema.statics.generateToken = function(): string {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new reset token for a user
 */
PasswordResetTokenSchema.statics.createForUser = async function(
  userId: mongoose.Types.ObjectId
): Promise<IPasswordResetToken> {
  // Invalidate any existing unused tokens for this user
  await this.updateMany(
    { userId, used: false },
    { used: true }
  );

  // Create new token that expires in 1 hour
  const token = this.generateToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return this.create({
    userId,
    token,
    expiresAt,
  });
};

/**
 * Verify and get token if valid
 */
PasswordResetTokenSchema.statics.verify = async function(
  token: string
): Promise<IPasswordResetToken | null> {
  const resetToken = await this.findOne({
    token,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  return resetToken;
};

// Fix for hot-reload OverwriteModelError in development
export default mongoose.models.PasswordResetToken || 
  mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
