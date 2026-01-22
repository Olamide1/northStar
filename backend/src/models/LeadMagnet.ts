import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadMagnet extends Document {
  projectId: mongoose.Types.ObjectId;
  type: 'CALCULATOR' | 'TEMPLATE_DOWNLOAD' | 'AUDIT_REQUEST' | 'STARTER_PACK' | 'CHECKLIST';
  title: string;
  description: string;
  ctaText: string;
  embedCode: string;
  theme: string;
  size: string;
  conversions: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeadMagnetSchema = new Schema<ILeadMagnet>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    type: {
      type: String,
      enum: ['CALCULATOR', 'TEMPLATE_DOWNLOAD', 'AUDIT_REQUEST', 'STARTER_PACK', 'CHECKLIST'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    ctaText: { type: String, required: true },
    embedCode: { type: String, required: true, unique: true },
    theme: { type: String, default: 'default' },
    size: { type: String, default: 'medium' },
    conversions: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILeadMagnet>('LeadMagnet', LeadMagnetSchema);
