import axios from 'axios';
import { 
  CourtListenerJudge, 
  CourtListenerPositionsResponse, 
  CourtListenerOpinionsResponse, 
  MergedJudgeData, 
  CourtListenerConfig,
  AIAnalysis 
} from './types';
import { AIAnalyzer } from './ai-analyzer';

export class JudgeProfileService {
  private courtListenerConfig: CourtListenerConfig;
  private aiAnalyzer: AIAnalyzer;

  constructor(courtListenerConfig: CourtListenerConfig, aiAnalyzer: AIAnalyzer) {
    this.courtListenerConfig = courtListenerConfig;
    this.aiAnalyzer = aiAnalyzer;
  }

  async getJudgeProfile(judgeId: string): Promise<AIAnalysis> {
    try {
      // Step 1: Fetch judge data from CourtListener API
      const judge = await this.fetchJudgeProfile(judgeId);
      
      // Step 2: Check if judge exists (handle 404s)
      if (!judge || judge.detail === 'Not found.') {
        throw new Error('Judge not found');
      }

      // Step 3: Fetch judge positions and recent opinions
      const [positions, opinions] = await Promise.all([
        this.fetchJudgePositions(judgeId),
        this.fetchRecentOpinions(judgeId)
      ]);

      // Step 4: Merge all data sources
      const mergedData: MergedJudgeData = {
        judge,
        positions,
        opinions
      };

      // Step 5: Generate AI analysis
      const analysis = await this.aiAnalyzer.analyzeJudgeData(mergedData);

      return analysis;
    } catch (error) {
      console.error('Error fetching judge profile:', error);
      throw error;
    }
  }

  private async fetchJudgeProfile(judgeId: string): Promise<CourtListenerJudge> {
    try {
      const response = await axios.get(
        `${this.courtListenerConfig.baseUrl}/people/${judgeId}/`,
        {
          headers: {
            'Authorization': `Token ${this.courtListenerConfig.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Judge not found');
      }
      throw new Error(`Failed to fetch judge profile: ${error}`);
    }
  }

  private async fetchJudgePositions(judgeId: string): Promise<CourtListenerPositionsResponse> {
    try {
      const response = await axios.get(
        `${this.courtListenerConfig.baseUrl}/people/${judgeId}/positions/`,
        {
          headers: {
            'Authorization': `Token ${this.courtListenerConfig.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching judge positions:', error);
      // Return empty positions if failed
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  }

  private async fetchRecentOpinions(judgeId: string): Promise<CourtListenerOpinionsResponse> {
    try {
      const response = await axios.get(
        `${this.courtListenerConfig.baseUrl}/people/${judgeId}/opinions/?limit=10`,
        {
          headers: {
            'Authorization': `Token ${this.courtListenerConfig.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching recent opinions:', error);
      // Return empty opinions if failed
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  }

  // Helper method to validate judge ID
  validateJudgeId(judgeId: string): boolean {
    return /^\d+$/.test(judgeId);
  }

  // Helper method to get basic judge info without AI analysis
  async getBasicJudgeInfo(judgeId: string) {
    try {
      const judge = await this.fetchJudgeProfile(judgeId);
      const positions = await this.fetchJudgePositions(judgeId);
      
      return {
        id: judge.id,
        name: judge.name_full,
        court: positions.results[0]?.court_name || 'Unknown Court',
        positions: positions.results,
        success: true
      };
    } catch (error) {
      throw error;
    }
  }
} 