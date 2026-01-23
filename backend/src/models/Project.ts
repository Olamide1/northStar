import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  websiteUrl: string;
  name?: string;
  description?: string;
  targetAudience?: string;
  productType?: string;
  competitors: string[];
  seedKeywords: string[];
  valueProps: string[];
  competitorAngles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    websiteUrl: { type: String, required: true },
    name: { type: String },
    description: { type: String },
    targetAudience: { type: String },
    productType: { type: String },
    competitors: { type: [String], default: [] },
    seedKeywords: { type: [String], default: [] },
    valueProps: { type: [String], default: [] },
    competitorAngles: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Fix for hot-reload OverwriteModelError in development
export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
