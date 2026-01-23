import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Article from '../models/Article';
import LeadMagnet from '../models/LeadMagnet';
import Lead from '../models/Lead';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { LeanLead, LeanArticleAnalytics, PopulatedProject } from '../types';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.ts:14',message:'dashboard: request received',data:{userId:req.userId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(()=>{});
    // #endregion
    
    const projects = await Project.find({
      userId: new mongoose.Types.ObjectId(req.userId),
    }).select('_id');

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.ts:24',message:'dashboard: projects fetched',data:{projectCount:projects.length,projectIds:projects.map(p=>p._id.toString())},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    const projectIds = projects.map(p => p._id);

    const [totalArticles, publishedArticles, totalLeads, totalLeadMagnets, recentLeadsRaw] =
      await Promise.all([
        Article.countDocuments({ projectId: { $in: projectIds } }),
        Article.countDocuments({
          projectId: { $in: projectIds },
          status: 'PUBLISHED',
        }),
        Lead.countDocuments({ userId: new mongoose.Types.ObjectId(req.userId) }),
        LeadMagnet.countDocuments({ projectId: { $in: projectIds } }),
        Lead.find({ userId: new mongoose.Types.ObjectId(req.userId) })
          .populate('leadMagnetId', 'title')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    // Type assertion after the query (cast through unknown for TypeScript)
    const recentLeads = recentLeadsRaw as unknown as LeanLead[];

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.ts:51',message:'dashboard: stats calculated',data:{totalArticles,publishedArticles,totalLeads,totalLeadMagnets,recentLeadsCount:recentLeads.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    res.json({
      stats: {
        totalArticles,
        publishedArticles,
        totalLeads,
        totalLeadMagnets,
      },
      recentLeads: recentLeads.map((lead) => ({
        id: lead._id.toString(),
        email: lead.email,
        name: lead.name,
        source: lead.source,
        referrer: lead.referrer,
        createdAt: lead.createdAt,
        leadMagnet: typeof lead.leadMagnetId === 'object' && lead.leadMagnetId !== null && 'title' in lead.leadMagnetId
          ? { title: lead.leadMagnetId.title }
          : undefined,
      })),
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics.ts:75',message:'dashboard: ERROR',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(()=>{});
    // #endregion
    next(error);
  }
});

// Get article analytics
router.get('/articles/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('projectId');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify project belongs to user
    // projectId should be populated since we called .populate('projectId')
    // But TypeScript doesn't know this, so we need to check the type
    let project: PopulatedProject | null = null;
    
    if (typeof article.projectId === 'object' && article.projectId !== null && !(article.projectId instanceof mongoose.Types.ObjectId)) {
      // It's populated
      project = article.projectId as unknown as PopulatedProject;
    } else {
      // Not populated, fetch it
      const fetchedProject = await Project.findById(article.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }

    if (!project || project.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const ArticleAnalytics = (await import('../models/ArticleAnalytics')).default;
    const analyticsRaw = await ArticleAnalytics.find({ articleId: article._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    const analytics = analyticsRaw as unknown as LeanArticleAnalytics[];

    res.json({
      article: {
        id: article._id.toString(),
        ...article.toObject(),
        analytics: analytics.map((a) => ({
          id: a._id.toString(),
          date: a.date,
          views: a.views,
          timeOnPage: a.timeOnPage,
          ctaClicks: a.ctaClicks,
          conversions: a.conversions,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Track article view (public)
router.post('/articles/:id/view', async (req, res, next) => {
  try {
    await Article.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get leads
router.get('/leads', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const leadsRaw = await Lead.find({ userId: new mongoose.Types.ObjectId(req.userId) })
      .populate('leadMagnetId', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    const leads = leadsRaw as unknown as LeanLead[];

    res.json({
      leads: leads.map((lead) => ({
        id: lead._id.toString(),
        userId: lead.userId.toString(),
        projectId: lead.projectId?.toString(),
        leadMagnetId: lead.leadMagnetId?.toString(),
        articleId: lead.articleId?.toString(),
        email: lead.email,
        name: lead.name,
        metadata: lead.metadata,
        source: lead.source,
        referrer: lead.referrer,
        createdAt: lead.createdAt,
        leadMagnet: typeof lead.leadMagnetId === 'object' && lead.leadMagnetId !== null && 'title' in lead.leadMagnetId
          ? { title: lead.leadMagnetId.title, type: lead.leadMagnetId.type }
          : undefined,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Export leads
router.get('/leads/export', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const leadsRaw = await Lead.find({ userId: new mongoose.Types.ObjectId(req.userId) })
      .populate('leadMagnetId', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    const leads = leadsRaw as unknown as LeanLead[];

    // Convert to CSV format
    const csv = [
      ['Email', 'Name', 'Source', 'Lead Magnet', 'Date'].join(','),
      ...leads.map((lead) => {
        const magnet = typeof lead.leadMagnetId === 'object' && lead.leadMagnetId !== null && 'title' in lead.leadMagnetId
          ? lead.leadMagnetId
          : null;
        return [
          lead.email,
          lead.name || '',
          lead.source || '',
          magnet?.title || '',
          new Date(lead.createdAt).toISOString(),
        ].join(',');
      }),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// Get usage statistics for current billing period
router.get('/usage', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's projects
    const projects = await Project.find({
      userId: new mongoose.Types.ObjectId(req.userId),
    });

    const projectIds = projects.map(p => p._id);

    // Get current month's start date
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Count resources
    const [articlesThisMonth, totalLeadMagnets] = await Promise.all([
      Article.countDocuments({
        projectId: { $in: projectIds },
        createdAt: { $gte: startOfMonth },
      }),
      LeadMagnet.countDocuments({ projectId: { $in: projectIds } }),
    ]);

    // Define plan limits
    const PLAN_LIMITS = {
      FREE: { projects: 1, articles: 3, leadMagnets: 1 },
      STARTER: { projects: 3, articles: 25, leadMagnets: 5 },
      GROWTH: { projects: 10, articles: 100, leadMagnets: -1 },
      ENTERPRISE: { projects: -1, articles: -1, leadMagnets: -1 },
    };

    const limits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS];

    res.json({
      projectsUsed: projects.length,
      projectsLimit: limits.projects,
      articlesUsed: articlesThisMonth,
      articlesLimit: limits.articles,
      leadMagnetsUsed: totalLeadMagnets,
      leadMagnetsLimit: limits.leadMagnets,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
