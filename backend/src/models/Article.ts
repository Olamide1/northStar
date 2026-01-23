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
  
  // Keyword Analysis Metrics
  keywordMetrics?: {
    searchVolume: number;
    searchVolumeRange: string;
    trafficPotential: number;
    difficulty: number;
    difficultyLabel: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
    competition: 'Low' | 'Medium' | 'High';
    type: 'short-tail' | 'mid-tail' | 'long-tail' | 'question';
    wordCount: number;
    intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
    opportunityScore: number;
    priority: 'High' | 'Medium' | 'Low';
    estimatedCPC: number;
    contentLengthRecommendation: number;
    hasFeaturedSnippetPotential: boolean;
    seasonalityScore: number;
  };
  
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
    keywordMetrics: {
      type: {
        searchVolume: Number,
        searchVolumeRange: String,
        trafficPotential: Number,
        difficulty: Number,
        difficultyLabel: String,
        competition: String,
        type: String,
        wordCount: Number,
        intent: String,
        opportunityScore: Number,
        priority: String,
        estimatedCPC: Number,
        contentLengthRecommendation: Number,
        hasFeaturedSnippetPotential: Boolean,
        seasonalityScore: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Fix for hot-reload OverwriteModelError in development
export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
