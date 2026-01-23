import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  userId?: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  leadMagnetId?: mongoose.Types.ObjectId;
  articleId?: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  websiteUrl?: string;
  analysisData?: {
    seedKeywords?: string[];
    valueProps?: string[];
    competitorAngles?: string[];
    targetPersonas?: string[];
    useCases?: string[];
  };
  crawledData?: {
    title?: string;
    description?: string;
  };
  metadata?: Record<string, unknown>;
  source?: string;
  referrer?: string;
  converted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    leadMagnetId: { type: Schema.Types.ObjectId, ref: 'LeadMagnet' },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
    email: { type: String, required: true },
    name: { type: String },
    websiteUrl: { type: String },
    analysisData: {
      seedKeywords: [{ type: String }],
      valueProps: [{ type: String }],
      competitorAngles: [{ type: String }],
      targetPersonas: [{ type: String }],
      useCases: [{ type: String }],
    },
    crawledData: {
      title: { type: String },
      description: { type: String },
    },
    metadata: { type: Schema.Types.Mixed },
    source: { type: String, default: 'landing_page' },
    referrer: { type: String },
    converted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ converted: 1 });

// Fix for hot-reload OverwriteModelError in development
export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);
