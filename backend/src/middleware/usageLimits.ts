/**
 * Usage Limits Middleware
 * Enforces plan-based usage limits for various resources
 */

import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from './auth';
import User from '../models/User';
import Project from '../models/Project';
import Article from '../models/Article';
import LeadMagnet from '../models/LeadMagnet';

// Plan limits configuration
export const PLAN_LIMITS = {
  FREE: {
    projects: 1,
    articlesPerMonth: 3,
    leadMagnets: 1,
    canExport: false,
    canUseAPI: false,
  },
  STARTER: {
    projects: 3,
    articlesPerMonth: 25,
    leadMagnets: 5,
    canExport: true,
    canUseAPI: false,
  },
  GROWTH: {
    projects: 10,
    articlesPerMonth: 100,
    leadMagnets: -1, // unlimited
    canExport: true,
    canUseAPI: true,
  },
  ENTERPRISE: {
    projects: -1, // unlimited
    articlesPerMonth: -1, // unlimited
    leadMagnets: -1, // unlimited
    canExport: true,
    canUseAPI: true,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Get current usage for a user
 */
export async function getUserUsage(userId: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get start of current billing month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [projectCount, articleCountThisMonth, leadMagnetCount] = await Promise.all([
    Project.countDocuments({ userId: userObjectId }),
    Article.countDocuments({
      projectId: {
        $in: await Project.find({ userId: userObjectId }).select('_id').lean().then(p => p.map(proj => proj._id))
      },
      createdAt: { $gte: startOfMonth },
    }),
    LeadMagnet.countDocuments({
      projectId: {
        $in: await Project.find({ userId: userObjectId }).select('_id').lean().then(p => p.map(proj => proj._id))
      },
    }),
  ]);

  return {
    projects: projectCount,
    articlesThisMonth: articleCountThisMonth,
    leadMagnets: leadMagnetCount,
  };
}

/**
 * Check if user can perform an action based on their plan
 */
export async function checkUsageLimit(
  userId: string,
  userPlan: PlanType,
  resource: 'projects' | 'articles' | 'leadMagnets',
  requestedAmount: number = 1
): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  const limits = PLAN_LIMITS[userPlan];
  const usage = await getUserUsage(userId);

  switch (resource) {
    case 'projects': {
      const limit = limits.projects;
      const current = usage.projects;
      
      if (limit === -1) return { allowed: true }; // unlimited
      
      if (current + requestedAmount > limit) {
        return {
          allowed: false,
          reason: `Your ${userPlan} plan allows ${limit} project${limit > 1 ? 's' : ''}. You currently have ${current}. Upgrade to create more projects.`,
          current,
          limit,
        };
      }
      return { allowed: true, current, limit };
    }

    case 'articles': {
      const limit = limits.articlesPerMonth;
      const current = usage.articlesThisMonth;
      
      if (limit === -1) return { allowed: true }; // unlimited
      
      if (current + requestedAmount > limit) {
        return {
          allowed: false,
          reason: `Your ${userPlan} plan allows ${limit} article${limit > 1 ? 's' : ''} per month. You've used ${current}. Upgrade for more articles.`,
          current,
          limit,
        };
      }
      return { allowed: true, current, limit };
    }

    case 'leadMagnets': {
      const limit = limits.leadMagnets;
      const current = usage.leadMagnets;
      
      if (limit === -1) return { allowed: true }; // unlimited
      
      if (current + requestedAmount > limit) {
        return {
          allowed: false,
          reason: `Your ${userPlan} plan allows ${limit} lead magnet${limit > 1 ? 's' : ''}. You currently have ${current}. Upgrade to create more.`,
          current,
          limit,
        };
      }
      return { allowed: true, current, limit };
    }

    default:
      return { allowed: true };
  }
}

/**
 * Middleware to check project creation limit
 */
export const checkProjectLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const check = await checkUsageLimit(req.userId, user.plan, 'projects');
    
    if (!check.allowed) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        code: 'LIMIT_EXCEEDED',
        resource: 'projects',
        message: check.reason,
        current: check.current,
        limit: check.limit,
        upgradeUrl: '/dashboard/settings?tab=billing',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check article creation limit
 */
export const checkArticleLimit = (requestedCount: number = 1) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get count from request body if generating multiple
      const count = req.body.count || requestedCount;

      const check = await checkUsageLimit(req.userId, user.plan, 'articles', count);
      
      if (!check.allowed) {
        return res.status(403).json({
          error: 'Usage limit exceeded',
          code: 'LIMIT_EXCEEDED',
          resource: 'articles',
          message: check.reason,
          current: check.current,
          limit: check.limit,
          upgradeUrl: '/dashboard/settings?tab=billing',
        });
      }

      // Add usage info to request for logging
      req.usageInfo = {
        current: check.current || 0,
        limit: check.limit || 0,
        remaining: check.limit === -1 ? -1 : (check.limit || 0) - (check.current || 0),
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check lead magnet creation limit
 */
export const checkLeadMagnetLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const check = await checkUsageLimit(req.userId, user.plan, 'leadMagnets');
    
    if (!check.allowed) {
      return res.status(403).json({
        error: 'Usage limit exceeded',
        code: 'LIMIT_EXCEEDED',
        resource: 'leadMagnets',
        message: check.reason,
        current: check.current,
        limit: check.limit,
        upgradeUrl: '/dashboard/settings?tab=billing',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has feature access
 */
export function hasFeatureAccess(plan: PlanType, feature: 'export' | 'api'): boolean {
  const limits = PLAN_LIMITS[plan];
  
  switch (feature) {
    case 'export':
      return limits.canExport;
    case 'api':
      return limits.canUseAPI;
    default:
      return false;
  }
}

// Extend AuthRequest to include usage info
declare module './auth' {
  interface AuthRequest {
    usageInfo?: {
      current: number;
      limit: number;
      remaining: number;
    };
  }
}
