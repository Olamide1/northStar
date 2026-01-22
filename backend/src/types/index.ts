import mongoose from 'mongoose';

// Express Error type
export interface ExpressError extends Error {
  status?: number;
  statusCode?: number;
}

// Mongoose Lean Document types
export interface LeanLead {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  leadMagnetId?: mongoose.Types.ObjectId | {
    title: string;
    type?: string;
  };
  articleId?: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
  source?: string;
  referrer?: string;
  createdAt: Date;
}

export interface LeanArticleAnalytics {
  _id: mongoose.Types.ObjectId;
  articleId: mongoose.Types.ObjectId;
  date: Date;
  views: number;
  timeOnPage?: number;
  ctaClicks: number;
  conversions: number;
  createdAt: Date;
}

// Populated types
export interface PopulatedProject {
  _id: mongoose.Types.ObjectId;
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

export interface PopulatedLeadMagnet {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId | PopulatedProject;
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

export interface PopulatedArticle {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId | PopulatedProject;
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
