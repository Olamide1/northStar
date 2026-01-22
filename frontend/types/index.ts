// API Response Types
export interface ApiResponse<T> {
  data: T;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  image?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Project {
  id: string;
  userId: string;
  websiteUrl: string;
  name?: string;
  description?: string;
  targetAudience?: string;
  productType?: string;
  competitors: string[];
  seedKeywords: string[];
  valueProps: string[];
  competitorAngles: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    articles: number;
    leadMagnets: number;
  };
}

export interface Article {
  id: string;
  projectId: string;
  keyword: string;
  topic: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'NEEDS_REVIEW';
  publishedAt?: string;
  views: number;
  ctaClicks: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    name?: string;
    websiteUrl: string;
  };
  _count?: {
    leadMagnets: number;
  };
  leadMagnets?: Array<{
    id: string;
    leadMagnet: LeadMagnet;
    position: number;
  }>;
}

export interface LeadMagnet {
  id: string;
  projectId: string;
  type: 'CALCULATOR' | 'TEMPLATE_DOWNLOAD' | 'AUDIT_REQUEST' | 'STARTER_PACK' | 'CHECKLIST';
  title: string;
  description: string;
  ctaText: string;
  embedCode: string;
  theme: string;
  size: string;
  conversions: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    name?: string;
    websiteUrl: string;
  };
  _count?: {
    leads: number;
  };
}

export interface Lead {
  id: string;
  userId: string;
  projectId?: string;
  leadMagnetId?: string;
  articleId?: string;
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
  source?: string;
  referrer?: string;
  createdAt: string;
  leadMagnet?: {
    title: string;
    type: string;
  };
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  totalLeads: number;
  totalLeadMagnets: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLeads: Lead[];
}

export interface ProductAnalysis {
  seedKeywords: string[];
  valueProps: string[];
  competitorAngles: string[];
  targetPersonas: string[];
  useCases: string[];
}

export interface ProjectCreateResponse {
  project: Project | null;
  analysis: ProductAnalysis;
  crawledData: {
    title: string;
    description: string;
  };
}
