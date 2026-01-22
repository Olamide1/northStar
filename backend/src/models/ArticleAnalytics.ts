import mongoose, { Schema, Document } from 'mongoose';

export interface IArticleAnalytics extends Document {
  articleId: mongoose.Types.ObjectId;
  date: Date;
  views: number;
  timeOnPage?: number;
  ctaClicks: number;
  conversions: number;
  createdAt: Date;
}

const ArticleAnalyticsSchema = new Schema<IArticleAnalytics>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    date: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    timeOnPage: { type: Number },
    ctaClicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IArticleAnalytics>('ArticleAnalytics', ArticleAnalyticsSchema);
