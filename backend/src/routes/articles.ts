import express from 'express';
import mongoose from 'mongoose';
import Article from '../models/Article';
import Project from '../models/Project';
import { authenticate, AuthRequest } from '../middleware/auth';
import { checkArticleLimit } from '../middleware/usageLimits';
import { generateArticle } from '../services/openai';
import { analyzeKeyword } from '../services/keywordAnalysis';
import { PopulatedProject, PopulatedArticle, PopulatedLeadMagnet } from '../types';

const router = express.Router();

// Generate articles for a project
router.post('/generate', authenticate, checkArticleLimit(), async (req: AuthRequest, res, next) => {
  try {
    const { projectId, count = 10 } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: new mongoose.Types.ObjectId(req.userId),
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get keywords to generate articles for
    const keywords = project.seedKeywords.slice(0, count);
    const articles = [];

    // Generate articles
    for (const keyword of keywords) {
      try {
        // Analyze keyword metrics
        const keywordMetrics = analyzeKeyword(keyword);
        
        const articleData = await generateArticle(keyword, {
          title: project.name || project.websiteUrl,
          valueProps: project.valueProps,
          useCases: [],
          websiteUrl: project.websiteUrl,
        });

        // Create slug
        const slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Create article with keyword metrics
        const article = await Article.create({
          projectId: project._id,
          keyword,
          topic: keyword,
          title: articleData.title,
          slug: `${project._id}-${slug}`,
          content: articleData.content,
          metaTitle: articleData.metaTitle,
          metaDescription: articleData.metaDescription,
          status: 'DRAFT',
          keywordMetrics: {
            searchVolume: keywordMetrics.searchVolume,
            searchVolumeRange: keywordMetrics.searchVolumeRange,
            trafficPotential: keywordMetrics.trafficPotential,
            difficulty: keywordMetrics.difficulty,
            difficultyLabel: keywordMetrics.difficultyLabel,
            competition: keywordMetrics.competition,
            type: keywordMetrics.type,
            wordCount: keywordMetrics.wordCount,
            intent: keywordMetrics.intent,
            opportunityScore: keywordMetrics.opportunityScore,
            priority: keywordMetrics.priority,
            estimatedCPC: keywordMetrics.estimatedCPC,
            contentLengthRecommendation: keywordMetrics.contentLengthRecommendation,
            hasFeaturedSnippetPotential: keywordMetrics.hasFeaturedSnippetPotential,
            seasonalityScore: keywordMetrics.seasonalityScore,
          },
        });

        articles.push({
          id: article._id.toString(),
          ...article.toObject(),
        });
      } catch (error) {
        console.error(`Failed to generate article for keyword ${keyword}:`, error);
        // Continue with other articles
      }
    }

    res.json({ articles, count: articles.length });
  } catch (error) {
    next(error);
  }
});

// Get articles for a project
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { projectId, status } = req.query;

    const where: Record<string, unknown> = {};
    
    if (projectId) {
      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: new mongoose.Types.ObjectId(req.userId),
      });

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      where.projectId = new mongoose.Types.ObjectId(projectId as string);
    } else {
      // Get all projects for user, then articles
      const projects = await Project.find({
        userId: new mongoose.Types.ObjectId(req.userId),
      }).select('_id');
      where.projectId = { $in: projects.map(p => p._id) };
    }

    if (status) {
      where.status = status;
    }

    const articles = await Article.find(where)
      .populate('projectId', 'name websiteUrl')
      .sort({ createdAt: -1 })
      .lean();

    const ArticleLeadMagnet = (await import('../models/ArticleLeadMagnet')).default;

    const articlesWithCounts = await Promise.all(
      (articles as unknown as PopulatedArticle[]).map(async (article) => {
        const leadMagnetCount = await ArticleLeadMagnet.countDocuments({
          articleId: article._id,
        });

        const project = typeof article.projectId === 'object' && article.projectId !== null
          ? article.projectId as PopulatedProject
          : null;

        const projectIdStr = typeof article.projectId === 'object' && article.projectId !== null && !(article.projectId instanceof mongoose.Types.ObjectId)
          ? (article.projectId as PopulatedProject)._id.toString()
          : (article.projectId instanceof mongoose.Types.ObjectId ? article.projectId.toString() : String(article.projectId));

        return {
          id: article._id.toString(),
          projectId: projectIdStr,
          keyword: article.keyword,
          topic: article.topic,
          title: article.title,
          slug: article.slug,
          content: article.content,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          status: article.status,
          publishedAt: article.publishedAt,
          views: article.views,
          ctaClicks: article.ctaClicks,
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          project: project ? {
            name: project.name,
            websiteUrl: project.websiteUrl,
          } : undefined,
          _count: {
            leadMagnets: leadMagnetCount,
          },
        };
      })
    );

    res.json({ articles: articlesWithCounts });
  } catch (error) {
    next(error);
  }
});

// Get single article
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const articleRaw = await Article.findById(req.params.id)
      .populate('projectId')
      .lean();

    if (!articleRaw) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = articleRaw as unknown as PopulatedArticle;

    // Verify project belongs to user
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

    const ArticleLeadMagnet = (await import('../models/ArticleLeadMagnet')).default;
    const LeadMagnet = (await import('../models/LeadMagnet')).default;

    const leadMagnetsRaw = await ArticleLeadMagnet.find({ articleId: article._id })
      .populate('leadMagnetId')
      .lean();
    
    const leadMagnets = leadMagnetsRaw as unknown as any[];

    const articleData = article;
    const projectIdStr = typeof articleData.projectId === 'object' && articleData.projectId !== null && !(articleData.projectId instanceof mongoose.Types.ObjectId)
      ? (articleData.projectId as PopulatedProject)._id.toString()
      : (articleData.projectId instanceof mongoose.Types.ObjectId ? articleData.projectId.toString() : String(articleData.projectId));

    res.json({
      article: {
        id: articleData._id.toString(),
        projectId: projectIdStr,
        keyword: articleData.keyword,
        topic: articleData.topic,
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        status: articleData.status,
        publishedAt: articleData.publishedAt,
        views: articleData.views,
        ctaClicks: articleData.ctaClicks,
        createdAt: articleData.createdAt,
        updatedAt: articleData.updatedAt,
        project: {
          id: project._id.toString(),
          name: project.name,
          websiteUrl: project.websiteUrl,
        },
        leadMagnets: leadMagnets.map((lm: any) => {
          const leadMagnetIdStr = typeof lm.leadMagnetId === 'object' && lm.leadMagnetId !== null && !(lm.leadMagnetId instanceof mongoose.Types.ObjectId)
            ? (lm.leadMagnetId as PopulatedLeadMagnet)._id.toString()
            : (lm.leadMagnetId instanceof mongoose.Types.ObjectId ? lm.leadMagnetId.toString() : String(lm.leadMagnetId));

          return {
            id: lm._id?.toString() || '',
            articleId: lm.articleId.toString(),
            leadMagnetId: leadMagnetIdStr,
            position: lm.position,
            createdAt: lm.createdAt,
            leadMagnet: typeof lm.leadMagnetId === 'object' && lm.leadMagnetId !== null && !(lm.leadMagnetId instanceof mongoose.Types.ObjectId)
              ? {
                  id: (lm.leadMagnetId as PopulatedLeadMagnet)._id.toString(),
                  title: (lm.leadMagnetId as unknown as PopulatedLeadMagnet).title,
                  type: (lm.leadMagnetId as unknown as PopulatedLeadMagnet).type,
                }
              : undefined,
          };
        }),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update article
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('projectId');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify project belongs to user
    let project: PopulatedProject | null = null;
    
    if (typeof article.projectId === 'object' && article.projectId !== null && !(article.projectId instanceof mongoose.Types.ObjectId)) {
      project = article.projectId as unknown as PopulatedProject;
    } else {
      const fetchedProject = await Project.findById(article.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }

    if (!project || project.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updateData: Record<string, unknown> = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.content) updateData.content = req.body.content;
    if (req.body.metaTitle) updateData.metaTitle = req.body.metaTitle;
    if (req.body.metaDescription) updateData.metaDescription = req.body.metaDescription;
    if (req.body.status) {
      updateData.status = req.body.status;
      if (req.body.status === 'PUBLISHED' && !article.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updated = await Article.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ article: { id: updated._id.toString(), ...updated.toObject() } });
  } catch (error) {
    next(error);
  }
});

// Publish article
router.post('/:id/publish', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const article = await Article.findById(req.params.id).populate('projectId');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify project belongs to user
    let project: PopulatedProject | null = null;
    
    if (typeof article.projectId === 'object' && article.projectId !== null && !(article.projectId instanceof mongoose.Types.ObjectId)) {
      project = article.projectId as unknown as PopulatedProject;
    } else {
      const fetchedProject = await Project.findById(article.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }

    if (!project || project.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const updated = await Article.findByIdAndUpdate(
      req.params.id,
      {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ article: { id: updated._id.toString(), ...updated.toObject() } });
  } catch (error) {
    next(error);
  }
});

// Update article
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify article belongs to user's project
    const project = await Project.findById(article.projectId);
    if (!project || project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Allowed fields to update
    const allowedUpdates = [
      'title',
      'content',
      'metaTitle',
      'metaDescription',
      'status',
      'keyword',
      'topic',
    ];

    // Validate and update only allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (article as any)[key] = req.body[key];
      }
    });

    // If slug-related fields changed, regenerate slug
    if (req.body.title) {
      const slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      article.slug = `${article.projectId}-${slug}`;
    }

    await article.save();

    res.json({
      article: {
        id: article._id.toString(),
        ...article.toObject(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete article
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Verify article belongs to user's project
    const project = await Project.findById(article.projectId);
    if (!project || project.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await article.deleteOne();

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
