import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { crawlWebsite } from '../services/crawler';
import { analyzeProduct } from '../services/openai';
import { analyzeKeywords } from '../services/keywordAnalysis';
import { z } from 'zod';
import { PopulatedProject } from '../types';

const router = express.Router();

const createProjectSchema = z.object({
  websiteUrl: z.string().url(),
  name: z.string().optional(),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  productType: z.string().optional(),
  competitors: z.array(z.string()).optional(),
});

// Create project (with crawling and analysis)
router.post('/', optionalAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    
    // Crawl website
    const crawledData = await crawlWebsite(data.websiteUrl);
    
    // Analyze product with OpenAI
    const analysis = await analyzeProduct(crawledData, {
      targetAudience: data.targetAudience,
      productType: data.productType,
      competitors: data.competitors,
      description: data.description,
    });

    // Create project (only if user is authenticated)
    let project;
    if (req.userId) {
      project = await Project.create({
        userId: new mongoose.Types.ObjectId(req.userId),
        websiteUrl: data.websiteUrl,
        name: data.name || crawledData.title,
        description: data.description || crawledData.description,
        targetAudience: data.targetAudience,
        productType: data.productType,
        competitors: data.competitors || [],
        seedKeywords: analysis.seedKeywords,
        valueProps: analysis.valueProps,
        competitorAngles: analysis.competitorAngles,
      });
    }

    // Return analysis results (available even without auth for MVP)
    res.json({
      project: project ? {
        id: project._id.toString(),
        ...project.toObject(),
      } : null,
      analysis: {
        seedKeywords: analysis.seedKeywords,
        valueProps: analysis.valueProps,
        competitorAngles: analysis.competitorAngles,
        targetPersonas: analysis.targetPersonas,
        useCases: analysis.useCases,
      },
      crawledData: {
        title: crawledData.title,
        description: crawledData.description,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Get user's projects
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const projects = await Project.find({ userId: new mongoose.Types.ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .lean();

    // Get counts for each project
    const Article = (await import('../models/Article')).default;
    const LeadMagnet = (await import('../models/LeadMagnet')).default;

    const projectsWithCounts = await Promise.all(
      (projects as unknown as PopulatedProject[]).map(async (project) => {
        const [articleCount, leadMagnetCount] = await Promise.all([
          Article.countDocuments({ projectId: project._id }),
          LeadMagnet.countDocuments({ projectId: project._id }),
        ]);

        return {
          id: project._id.toString(),
          userId: project.userId.toString(),
          websiteUrl: project.websiteUrl,
          name: project.name,
          description: project.description,
          targetAudience: project.targetAudience,
          productType: project.productType,
          competitors: project.competitors,
          seedKeywords: project.seedKeywords,
          valueProps: project.valueProps,
          competitorAngles: project.competitorAngles,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          _count: {
            articles: articleCount,
            leadMagnets: leadMagnetCount,
          },
        };
      })
    );

    res.json({ projects: projectsWithCounts });
  } catch (error) {
    next(error);
  }
});

// Get single project
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.userId),
    }).lean();

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectData = project as unknown as PopulatedProject;

    const Article = (await import('../models/Article')).default;
    const LeadMagnet = (await import('../models/LeadMagnet')).default;

    const [articleCount, leadMagnetCount] = await Promise.all([
      Article.countDocuments({ projectId: projectData._id }),
      LeadMagnet.countDocuments({ projectId: projectData._id }),
    ]);
    res.json({
      project: {
        id: projectData._id.toString(),
        userId: projectData.userId.toString(),
        websiteUrl: projectData.websiteUrl,
        name: projectData.name,
        description: projectData.description,
        targetAudience: projectData.targetAudience,
        productType: projectData.productType,
        competitors: projectData.competitors,
        seedKeywords: projectData.seedKeywords,
        valueProps: projectData.valueProps,
        competitorAngles: projectData.competitorAngles,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
        _count: {
          articles: articleCount,
          leadMagnets: leadMagnetCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Analyze keywords for a project
router.get('/:id/keyword-analysis', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.userId),
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Analyze all seed keywords
    const keywordAnalysis = analyzeKeywords(project.seedKeywords);

    res.json({
      keywords: keywordAnalysis,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
