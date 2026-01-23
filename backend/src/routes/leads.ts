import express from 'express';
import Lead from '../models/Lead';
import { z } from 'zod';

const router = express.Router();

const captureLeadSchema = z.object({
  email: z.string().email('Invalid email address'),
  websiteUrl: z.string().url('Invalid website URL'),
  analysisData: z.object({
    seedKeywords: z.array(z.string()).optional(),
    valueProps: z.array(z.string()).optional(),
    competitorAngles: z.array(z.string()).optional(),
    targetPersonas: z.array(z.string()).optional(),
    useCases: z.array(z.string()).optional(),
  }).optional(),
  crawledData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
});

// Capture lead from landing page
router.post('/capture', async (req, res, next) => {
  try {
    const data = captureLeadSchema.parse(req.body);

    // Check if lead already exists (by email and websiteUrl)
    const existingLead = await Lead.findOne({
      email: data.email,
      websiteUrl: data.websiteUrl,
    });

    if (existingLead) {
      // Update existing lead with new data
      existingLead.analysisData = data.analysisData;
      existingLead.crawledData = data.crawledData;
      existingLead.source = data.source || existingLead.source;
      existingLead.referrer = data.referrer || existingLead.referrer;
      await existingLead.save();

      return res.json({
        success: true,
        lead: {
          id: existingLead._id.toString(),
          email: existingLead.email,
          websiteUrl: existingLead.websiteUrl,
          createdAt: existingLead.createdAt,
        },
        message: 'Lead updated successfully',
      });
    }

    // Create new lead
    const lead = await Lead.create({
      email: data.email,
      websiteUrl: data.websiteUrl,
      analysisData: data.analysisData,
      crawledData: data.crawledData,
      source: data.source || 'landing_page',
      referrer: data.referrer,
      converted: false,
    });

    res.json({
      success: true,
      lead: {
        id: lead._id.toString(),
        email: lead.email,
        websiteUrl: lead.websiteUrl,
        createdAt: lead.createdAt,
      },
      message: 'Lead captured successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: error.errors[0].message 
      });
    }
    next(error);
  }
});

export default router;
