import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  leadMagnetId?: mongoose.Types.ObjectId;
  articleId?: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
  source?: string;
  referrer?: string;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    leadMagnetId: { type: Schema.Types.ObjectId, ref: 'LeadMagnet' },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
    email: { type: String, required: true },
    name: { type: String },
    metadata: { type: Schema.Types.Mixed },
    source: { type: String },
    referrer: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILead>('Lead', LeadSchema);
