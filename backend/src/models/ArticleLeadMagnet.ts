import mongoose, { Schema, Document } from 'mongoose';

export interface IArticleLeadMagnet extends Document {
  articleId: mongoose.Types.ObjectId;
  leadMagnetId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
}

const ArticleLeadMagnetSchema = new Schema<IArticleLeadMagnet>(
  {
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    leadMagnetId: { type: Schema.Types.ObjectId, ref: 'LeadMagnet', required: true },
    position: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

ArticleLeadMagnetSchema.index({ articleId: 1, leadMagnetId: 1, position: 1 }, { unique: true });

// Fix for hot-reload OverwriteModelError in development
export default mongoose.models.ArticleLeadMagnet || mongoose.model<IArticleLeadMagnet>('ArticleLeadMagnet', ArticleLeadMagnetSchema);
