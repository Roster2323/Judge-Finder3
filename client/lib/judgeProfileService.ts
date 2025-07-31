import { AIAnalysis } from '../types/judge-profile';

export interface JudgeProfileResponse {
  judge: {
    id: string;
    name: string;
    court: string;
    positions: any[];
    recentOpinions: any[];
  };
  analysis: AIAnalysis;
}

export interface BasicJudgeInfo {
  id: number;
  name: string;
  court: string;
  positions: any[];
  success: boolean;
}

export class JudgeProfileService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch judge profile with AI analysis
   */
  async fetchJudgeProfile(judgeId: string): Promise<AIAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/judge-profile/${judgeId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Judge not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching judge profile:', error);
      throw error;
    }
  }

  /**
   * Fetch basic judge information without AI analysis
   */
  async fetchBasicJudgeInfo(judgeId: string): Promise<BasicJudgeInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/judge-profile/${judgeId}/basic`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Judge not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching basic judge info:', error);
      throw error;
    }
  }

  /**
   * Check if the judge profile API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/judge-profile/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Validate judge ID format
   */
  validateJudgeId(judgeId: string): boolean {
    return /^\d+$/.test(judgeId);
  }

  /**
   * Create a loading state object
   */
  createLoadingState() {
    return {
      loading: true,
      error: null,
      data: null
    };
  }

  /**
   * Create an error state object
   */
  createErrorState(error: string) {
    return {
      loading: false,
      error,
      data: null
    };
  }

  /**
   * Create a success state object
   */
  createSuccessState(data: AIAnalysis) {
    return {
      loading: false,
      error: null,
      data
    };
  }
}

// Export a default instance
export const judgeProfileService = new JudgeProfileService(); 