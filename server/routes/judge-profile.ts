import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { JudgeProfileService } from '../lib/judge-profile/judge-profile.service';
import { AIAnalyzer } from '../lib/judge-profile/ai-analyzer';
import { CourtListenerConfig, OpenAIConfig, ErrorResponse } from '../lib/judge-profile/types';

// Rate limiting configuration
const judgeProfileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    success: false
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize configurations
const courtListenerConfig: CourtListenerConfig = {
  baseUrl: 'https://www.courtlistener.com/api/rest/v4',
      token: process.env.COURTLISTENER_TOKEN || process.env.REACT_APP_COURTLISTENER_TOKEN || ''
};

const openAIConfig: OpenAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 2000
};

// Initialize services
const aiAnalyzer = new AIAnalyzer(openAIConfig);
const judgeProfileService = new JudgeProfileService(courtListenerConfig, aiAnalyzer);

// CORS headers helper
const setCorsHeaders = (res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// Error response helper
const sendErrorResponse = (res: Response, statusCode: number, message: string) => {
  setCorsHeaders(res);
  const errorResponse: ErrorResponse = {
    error: message,
    message: message,
    success: false
  };
  res.status(statusCode).json(errorResponse);
};

// Main judge profile endpoint
export const getJudgeProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate judge ID
    if (!id || !judgeProfileService.validateJudgeId(id)) {
      return sendErrorResponse(res, 400, 'Invalid judge ID provided');
    }

    // Check if required environment variables are set
    if (!courtListenerConfig.token) {
      console.error('CourtListener token not configured');
      return sendErrorResponse(res, 500, 'Service configuration error');
    }

    if (!openAIConfig.apiKey) {
      console.error('OpenAI API key not configured');
      return sendErrorResponse(res, 500, 'AI service configuration error');
    }

    // Get judge profile with AI analysis
    const analysis = await judgeProfileService.getJudgeProfile(id);

    // Set CORS headers and send response
    setCorsHeaders(res);
    res.status(200).json(analysis);

  } catch (error) {
    console.error('Judge profile error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Judge not found') {
        return sendErrorResponse(res, 404, 'The requested judge could not be found in our database.');
      }
    }
    
    return sendErrorResponse(res, 500, 'Internal server error');
  }
};

// Basic judge info endpoint (without AI analysis)
export const getBasicJudgeInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate judge ID
    if (!id || !judgeProfileService.validateJudgeId(id)) {
      return sendErrorResponse(res, 400, 'Invalid judge ID provided');
    }

    // Check if required environment variables are set
    if (!courtListenerConfig.token) {
      console.error('CourtListener token not configured');
      return sendErrorResponse(res, 500, 'Service configuration error');
    }

    // Get basic judge info
    const judgeInfo = await judgeProfileService.getBasicJudgeInfo(id);

    // Set CORS headers and send response
    setCorsHeaders(res);
    res.status(200).json(judgeInfo);

  } catch (error) {
    console.error('Basic judge info error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Judge not found') {
        return sendErrorResponse(res, 404, 'The requested judge could not be found in our database.');
      }
    }
    
    return sendErrorResponse(res, 500, 'Internal server error');
  }
};

// Health check endpoint
export const healthCheck = (req: Request, res: Response) => {
  setCorsHeaders(res);
  res.status(200).json({
    status: 'healthy',
    service: 'judge-profile-api',
    timestamp: new Date().toISOString()
  });
};

// Export the rate limiter for use in main app
export { judgeProfileLimiter }; 