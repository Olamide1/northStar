import express from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project';
import Article from '../models/Article';
import LeadMagnet from '../models/LeadMagnet';
import Lead from '../models/Lead';
import ArticleLeadMagnet from '../models/ArticleLeadMagnet';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateLeadMagnet } from '../services/openai';
import { PopulatedProject, PopulatedLeadMagnet } from '../types';

const router = express.Router();

// Generate lead magnet
router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { projectId, type, articleId } = req.body;

    // Verify project belongs to user
    const project = await Project.findOne({
      _id: projectId,
      userId: new mongoose.Types.ObjectId(req.userId),
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get article context if provided
    let articleContext;
    if (articleId) {
      const article = await Article.findOne({
        _id: articleId,
        projectId: project._id,
      });
      articleContext = article?.content;
    }

    // Generate lead magnet copy
    const magnetData = await generateLeadMagnet(
      type || 'CHECKLIST',
      {
        title: project.name || project.websiteUrl,
        valueProps: project.valueProps,
        useCases: [],
      },
      articleContext
    );

    // Generate unique embed code
    const embedCode = `northstar-${project._id}-${Date.now()}`;

    // Create lead magnet
    const leadMagnet = await LeadMagnet.create({
      projectId: project._id,
      type: type || 'CHECKLIST',
      title: magnetData.title,
      description: magnetData.description,
      ctaText: magnetData.ctaText,
      embedCode,
    });

    res.json({ leadMagnet: { id: leadMagnet._id.toString(), ...leadMagnet.toObject() } });
  } catch (error) {
    next(error);
  }
});

// Get lead magnet by embed code (public)
router.get('/:embedCode/data', async (req, res, next) => {
  try {
    const leadMagnet = await LeadMagnet.findOne({ embedCode: req.params.embedCode }).lean();

    if (!leadMagnet) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    res.json({ leadMagnet: { id: leadMagnet._id.toString(), ...leadMagnet } });
  } catch (error) {
    next(error);
  }
});

// Get lead magnets for a project
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { projectId } = req.query;

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
      // Get all projects for user
      const projects = await Project.find({
        userId: new mongoose.Types.ObjectId(req.userId),
      }).select('_id');
      where.projectId = { $in: projects.map(p => p._id) };
    }

    const leadMagnets = await LeadMagnet.find(where)
      .populate('projectId', 'name websiteUrl')
      .sort({ createdAt: -1 })
      .lean();

    const leadMagnetsWithCounts = await Promise.all(
      (leadMagnets as PopulatedLeadMagnet[]).map(async (magnet) => {
        const leadCount = await Lead.countDocuments({ leadMagnetId: magnet._id });
        const project = typeof magnet.projectId === 'object' && magnet.projectId !== null && !(magnet.projectId instanceof mongoose.Types.ObjectId)
          ? magnet.projectId as unknown as PopulatedProject
          : null;

        const projectIdStr = typeof magnet.projectId === 'object' && magnet.projectId !== null && !(magnet.projectId instanceof mongoose.Types.ObjectId)
          ? (magnet.projectId as PopulatedProject)._id.toString()
          : (magnet.projectId instanceof mongoose.Types.ObjectId ? magnet.projectId.toString() : String(magnet.projectId));

        return {
          id: magnet._id.toString(),
          projectId: projectIdStr,
          type: magnet.type,
          title: magnet.title,
          description: magnet.description,
          ctaText: magnet.ctaText,
          embedCode: magnet.embedCode,
          theme: magnet.theme,
          size: magnet.size,
          conversions: magnet.conversions,
          views: magnet.views,
          createdAt: magnet.createdAt,
          updatedAt: magnet.updatedAt,
          project: project ? {
            name: project.name,
            websiteUrl: project.websiteUrl,
          } : undefined,
          _count: {
            leads: leadCount,
          },
        };
      })
    );

    res.json({ leadMagnets: leadMagnetsWithCounts });
  } catch (error) {
    next(error);
  }
});

// Get single lead magnet
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const leadMagnet = await LeadMagnet.findById(req.params.id)
      .populate('projectId')
      .lean();

    if (!leadMagnet) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    // Verify project belongs to user
    let project: PopulatedProject | null = null;
    
    if (typeof leadMagnet.projectId === 'object' && leadMagnet.projectId !== null && !(leadMagnet.projectId instanceof mongoose.Types.ObjectId)) {
      // It's populated
      project = leadMagnet.projectId as unknown as PopulatedProject;
    } else {
      // Not populated, fetch it
      const fetchedProject = await Project.findById(leadMagnet.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }
    
    if (!project || project.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    const leadMagnetData = {
      id: leadMagnet._id.toString(),
      projectId: project._id.toString(),
      type: leadMagnet.type,
      title: leadMagnet.title,
      description: leadMagnet.description,
      ctaText: leadMagnet.ctaText,
      embedCode: leadMagnet.embedCode,
      theme: leadMagnet.theme,
      size: leadMagnet.size,
      conversions: leadMagnet.conversions,
      views: leadMagnet.views,
      createdAt: leadMagnet.createdAt,
      updatedAt: leadMagnet.updatedAt,
      project: {
        id: project._id.toString(),
        name: project.name,
        websiteUrl: project.websiteUrl,
      },
    };

    res.json({ leadMagnet: leadMagnetData });
  } catch (error) {
    next(error);
  }
});

// Update lead magnet
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const leadMagnet = await LeadMagnet.findById(req.params.id).populate('projectId');

    if (!leadMagnet) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    // Verify project belongs to user
    let project: PopulatedProject | null = null;
    
    if (typeof leadMagnet.projectId === 'object' && leadMagnet.projectId !== null && !(leadMagnet.projectId instanceof mongoose.Types.ObjectId)) {
      // It's populated
      project = leadMagnet.projectId as unknown as PopulatedProject;
    } else {
      // Not populated, fetch it
      const fetchedProject = await Project.findById(leadMagnet.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }
    
    if (!project || project.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    const updateData: Record<string, unknown> = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.ctaText) updateData.ctaText = req.body.ctaText;
    if (req.body.theme) updateData.theme = req.body.theme;
    if (req.body.size) updateData.size = req.body.size;

    const updated = await LeadMagnet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }
    res.json({ leadMagnet: { id: updated._id.toString(), ...updated.toObject() } });
  } catch (error) {
    next(error);
  }
});

// Attach lead magnet to article
router.post('/:id/attach', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { articleId, position } = req.body;

    const leadMagnet = await LeadMagnet.findById(req.params.id).populate('projectId');

    if (!leadMagnet) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    // Verify project belongs to user
    let project: PopulatedProject | null = null;
    
    if (typeof leadMagnet.projectId === 'object' && leadMagnet.projectId !== null && !(leadMagnet.projectId instanceof mongoose.Types.ObjectId)) {
      // It's populated
      project = leadMagnet.projectId as unknown as PopulatedProject;
    } else {
      // Not populated, fetch it
      const fetchedProject = await Project.findById(leadMagnet.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }
    
    if (!project || project.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    const article = await Article.findOne({
      _id: articleId,
      projectId: leadMagnet.projectId,
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const attachment = await ArticleLeadMagnet.create({
      articleId: article._id,
      leadMagnetId: leadMagnet._id,
      position: position || 1,
    });

    res.json({ attachment: { id: attachment._id.toString(), ...attachment.toObject() } });
  } catch (error) {
    next(error);
  }
});

// Capture lead (public endpoint)
router.post('/:embedCode/capture', async (req, res, next) => {
  try {
    const { embedCode } = req.params;
    const { email, name, metadata } = req.body;

    const leadMagnet = await LeadMagnet.findOne({ embedCode }).populate('projectId');

    if (!leadMagnet) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    let project: PopulatedProject | null = null;
    
    if (typeof leadMagnet.projectId === 'object' && leadMagnet.projectId !== null && !(leadMagnet.projectId instanceof mongoose.Types.ObjectId)) {
      // It's populated
      project = leadMagnet.projectId as unknown as PopulatedProject;
    } else {
      // Not populated, fetch it
      const fetchedProject = await Project.findById(leadMagnet.projectId);
      if (fetchedProject) {
        project = fetchedProject.toObject() as PopulatedProject;
      }
    }

    if (!project) {
      return res.status(404).json({ error: 'Lead magnet not found' });
    }

    // Create lead
    const lead = await Lead.create({
      userId: project.userId,
      projectId: project._id,
      leadMagnetId: leadMagnet._id,
      email,
      name,
      metadata: metadata || {},
      source: 'embed',
    });

    // Update conversion count
    await LeadMagnet.findByIdAndUpdate(leadMagnet._id, {
      $inc: { conversions: 1, views: 1 },
    });

    res.json({ success: true, lead: { id: lead._id.toString(), ...lead.toObject() } });
  } catch (error) {
    next(error);
  }
});

export default router;
