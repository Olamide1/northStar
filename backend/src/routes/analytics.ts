import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Article from '../models/Article';
import LeadMagnet from '../models/LeadMagnet';
import Lead from '../models/Lead';
import { authenticate, AuthRequest } from '../middleware/auth';
import { LeanLead, LeanArticleAnalytics, PopulatedProject } from '../types';

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const projects = await Project.find({
      userId: new mongoose.Types.ObjectId(req.userId),
    }).select('_id');

    const projectIds = projects.map(p => p._id);

    const [totalArticles, publishedArticles, totalLeads, totalLeadMagnets, recentLeads] =
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

    res.json({
      stats: {
        totalArticles,
        publishedArticles,
        totalLeads,
        totalLeadMagnets,
      },
      recentLeads: recentLeads.map((lead: LeanLead) => ({
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
    const analytics = await ArticleAnalytics.find({ articleId: article._id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    res.json({
      article: {
        id: article._id.toString(),
        ...article.toObject(),
        analytics: (analytics as LeanArticleAnalytics[]).map((a) => ({
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
    const leads = await Lead.find({ userId: new mongoose.Types.ObjectId(req.userId) })
      .populate('leadMagnetId', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      leads: (leads as LeanLead[]).map((lead) => ({
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
    const leads = await Lead.find({ userId: new mongoose.Types.ObjectId(req.userId) })
      .populate('leadMagnetId', 'title type')
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV format
    const csv = [
      ['Email', 'Name', 'Source', 'Lead Magnet', 'Date'].join(','),
      ...(leads as LeanLead[]).map((lead) => {
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

export default router;
