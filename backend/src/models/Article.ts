import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  projectId: mongoose.Types.ObjectId;
  keyword: string;
  topic: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'NEEDS_REVIEW';
  publishedAt?: Date;
  views: number;
  ctaClicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    keyword: { type: String, required: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'NEEDS_REVIEW'],
      default: 'DRAFT',
    },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    ctaClicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IArticle>('Article', ArticleSchema);
