import OpenAI from 'openai';
import { MergedJudgeData, AIAnalysis, OpenAIConfig } from './types';

export class AIAnalyzer {
  private openai: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async analyzeJudgeData(judgeData: MergedJudgeData): Promise<AIAnalysis> {
    try {
      const prompt = this.createAnalysisPrompt(judgeData);
      
      const completion = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a legal AI assistant that analyzes judge profiles and provides comprehensive insights about their ruling patterns, experience, and courtroom expectations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      });

      const responseText = completion.choices[0]?.message?.content;
      
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse as JSON, fallback to structured response if needed
      try {
        const analysis = JSON.parse(responseText);
        return this.validateAnalysisResponse(analysis);
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        return this.createStructuredResponse(judgeData, responseText);
      }
    } catch (error) {
      console.error('AI Analysis error:', error);
      return this.createFallbackResponse(judgeData);
    }
  }

  private createAnalysisPrompt(judgeData: MergedJudgeData): string {
    const { judge, positions, opinions } = judgeData;
    
    return `Analyze the following judge data and create a comprehensive profile in JSON format. Include:

1. Basic information (name, circuit, tier, appointed by, years of service, alma mater)
2. Ruling tendencies by category with percentages
3. Recent cases summary
4. Overall summary
5. Courtroom expectations

Judge Data:
Name: ${judge.name_full}
Positions: ${JSON.stringify(positions.results)}
Recent Opinions: ${JSON.stringify(opinions.results)}

Return a JSON object with this structure:
{
  "id": "${judge.id}",
  "name": "Full Name",
  "circuit": "Court Name",
  "tier": "federal/state/local",
  "appointedBy": "President Name",
  "yearsOfService": "X years",
  "almaMater": "Law School",
  "rulingTendencies": [
    {"category": "Civil Procedure", "percentage": 65, "description": "..."}
  ],
  "recentCases": [
    {"id": 123, "title": "Case Name", "date": "2024-01-01", "description": "..."}
  ],
  "summary": "Overall summary...",
  "courtroomExpectations": "What to expect...",
  "success": true,
  "lastUpdated": "${new Date().toISOString()}"
}`;
  }

  private validateAnalysisResponse(response: any): AIAnalysis {
    // Ensure all required fields are present
    const requiredFields = [
      'id', 'name', 'circuit', 'tier', 'appointedBy', 
      'yearsOfService', 'almaMater', 'rulingTendencies', 
      'recentCases', 'summary', 'courtroomExpectations', 
      'success', 'lastUpdated'
    ];

    for (const field of requiredFields) {
      if (!(field in response)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return response as AIAnalysis;
  }

  private createStructuredResponse(judgeData: MergedJudgeData, aiResponse: string): AIAnalysis {
    const { judge, positions, opinions } = judgeData;
    
    // Extract basic information from positions
    const currentPosition = positions.results[0];
    const circuit = currentPosition?.court_name || 'Unknown Court';
    const tier = this.determineTier(currentPosition?.court_type);
    
    return {
      id: judge.id.toString(),
      name: judge.name_full,
      circuit,
      tier,
      appointedBy: 'Unknown',
      yearsOfService: this.calculateYearsOfService(currentPosition),
      almaMater: 'Unknown',
      rulingTendencies: [
        {
          category: 'General',
          percentage: 50,
          description: 'Based on available data'
        }
      ],
      recentCases: opinions.results.slice(0, 5).map(opinion => ({
        id: opinion.id,
        title: `Case ${opinion.id}`,
        date: opinion.date_filed,
        description: opinion.plain_text?.substring(0, 200) + '...' || 'No description available'
      })),
      summary: aiResponse.substring(0, 500) + '...',
      courtroomExpectations: 'Expectations based on available data',
      success: true,
      lastUpdated: new Date().toISOString()
    };
  }

  private createFallbackResponse(judgeData: MergedJudgeData): AIAnalysis {
    const { judge, positions } = judgeData;
    const currentPosition = positions.results[0];
    
    return {
      id: judge.id.toString(),
      name: judge.name_full,
      circuit: currentPosition?.court_name || 'Unknown Court',
      tier: this.determineTier(currentPosition?.court_type),
      appointedBy: 'Unknown',
      yearsOfService: this.calculateYearsOfService(currentPosition),
      almaMater: 'Unknown',
      rulingTendencies: [
        {
          category: 'General',
          percentage: 50,
          description: 'Analysis unavailable'
        }
      ],
      recentCases: [],
      summary: 'Analysis temporarily unavailable. Please try again later.',
      courtroomExpectations: 'Unable to provide expectations at this time.',
      success: false,
      lastUpdated: new Date().toISOString()
    };
  }

  private determineTier(courtType?: string): string {
    if (!courtType) return 'unknown';
    
    const lowerType = courtType.toLowerCase();
    if (lowerType.includes('federal') || lowerType.includes('supreme')) {
      return 'federal';
    } else if (lowerType.includes('state')) {
      return 'state';
    } else {
      return 'local';
    }
  }

  private calculateYearsOfService(position?: any): string {
    if (!position?.date_start) return 'Unknown';
    
    const startDate = new Date(position.date_start);
    const endDate = position.date_termination ? new Date(position.date_termination) : new Date();
    const years = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
    
    return `${years} years`;
  }
} 