import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';
import Project from '../models/Project';
import Lead from '../models/Lead';
import PasswordResetToken from '../models/PasswordResetToken';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const registerWithAnalysisSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  websiteUrl: z.string().url(),
  analysisData: z.object({
    seedKeywords: z.array(z.string()).optional(),
    valueProps: z.array(z.string()).optional(),
    competitorAngles: z.array(z.string()).optional(),
    targetPersonas: z.array(z.string()).optional(),
    useCases: z.array(z.string()).optional(),
  }),
  crawledData: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  source: z.string().optional(),
  referrer: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      provider: 'email',
    });

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== 'string') {
      throw new Error('JWT_SECRET is not configured');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn } as SignOptions
    );

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Register with Analysis (from landing page)
router.post('/register-with-analysis', async (req, res, next) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:134',message:'register-with-analysis: request received',data:{email:req.body.email,hasAnalysisData:!!req.body.analysisData,websiteUrl:req.body.websiteUrl},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const data = registerWithAnalysisSchema.parse(req.body);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:139',message:'register-with-analysis: validation passed',data:{email:data.email,keywordCount:data.analysisData.seedKeywords?.length,valuePropsCount:data.analysisData.valueProps?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Check if user exists
    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:147',message:'register-with-analysis: user already exists',data:{email:data.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return res.status(400).json({ 
        error: 'Email already registered',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      provider: 'email',
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:168',message:'register-with-analysis: user created',data:{userId:user._id.toString(),email:user.email},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Create project from analysis
    const project = await Project.create({
      userId: new mongoose.Types.ObjectId(user._id),
      websiteUrl: data.websiteUrl,
      name: data.crawledData?.title || data.websiteUrl,
      description: data.crawledData?.description || '',
      seedKeywords: data.analysisData.seedKeywords || [],
      valueProps: data.analysisData.valueProps || [],
      competitorAngles: data.analysisData.competitorAngles || [],
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:184',message:'register-with-analysis: project created',data:{projectId:project._id.toString(),websiteUrl:project.websiteUrl,keywordCount:project.seedKeywords.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Create lead record (marked as converted)
    await Lead.create({
      userId: new mongoose.Types.ObjectId(user._id),
      projectId: new mongoose.Types.ObjectId(project._id),
      email: data.email,
      name: data.name,
      websiteUrl: data.websiteUrl,
      analysisData: data.analysisData,
      crawledData: data.crawledData,
      source: data.source || 'landing_page',
      referrer: data.referrer,
      converted: true,
    });

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== 'string') {
      throw new Error('JWT_SECRET is not configured');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn } as SignOptions
    );

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:218',message:'register-with-analysis: success, sending response',data:{userId:user._id.toString(),projectId:project._id.toString(),hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      token,
      project: {
        id: project._id.toString(),
        websiteUrl: project.websiteUrl,
        name: project.name,
        seedKeywords: project.seedKeywords,
        valueProps: project.valueProps,
        competitorAngles: project.competitorAngles,
      },
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/f2fbf436-c70b-4955-b617-598cbb53b153',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:242',message:'register-with-analysis: ERROR',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== 'string') {
      throw new Error('JWT_SECRET is not configured');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn } as SignOptions
    );

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Get current user
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || typeof jwtSecret !== 'string') {
      return res.status(401).json({ error: 'JWT_SECRET is not configured' });
    }
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        plan: user.plan,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Cannot change password for OAuth users' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Don't allow password reset for OAuth users
    if (!user.password) {
      return res.json({
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = await (PasswordResetToken as any).createForUser(user._id);

    // TODO: Send email with reset link
    // For now, we'll return the token in development mode only
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`;
    
    // In production, you would send an email instead
    console.log('Password reset URL:', resetUrl);
    console.log('Reset token:', resetToken.token);

    res.json({
      message: 'If an account exists with that email, a password reset link has been sent.',
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === 'development' && { resetUrl, token: resetToken.token }),
    });
  } catch (error) {
    next(error);
  }
});

// Verify reset token
router.get('/reset-password/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const resetToken = await (PasswordResetToken as any).verify(token);

    if (!resetToken) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN',
      });
    }

    // Get user info without sensitive data
    const user = await User.findById(resetToken.userId).select('email name');

    res.json({
      valid: true,
      email: user?.email,
    });
  } catch (error) {
    next(error);
  }
});

// Reset password with token
router.post('/reset-password', async (req, res, next) => {
  try {
    const schema = z.object({
      token: z.string().min(1, 'Token is required'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    });

    const { token, password } = schema.parse(req.body);

    const resetToken = await (PasswordResetToken as any).verify(token);

    if (!resetToken) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        code: 'INVALID_TOKEN',
      });
    }

    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    res.json({
      message: 'Password successfully reset. You can now log in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

export default router;
