// AI Analysis Types
export interface AIAnalysis {
  id: string;
  name: string;
  circuit: string;
  tier: string;
  appointedBy: string;
  yearsOfService: string;
  almaMater: string;
  rulingTendencies: RulingTendency[];
  recentCases: RecentCase[];
  summary: string;
  courtroomExpectations: string;
  success: boolean;
  lastUpdated: string;
}

export interface RulingTendency {
  category: string;
  percentage: number;
  description: string;
}

export interface RecentCase {
  id: number;
  title: string;
  date: string;
  description: string;
}

// API Response Types
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

// State Management Types
export interface JudgeProfileState {
  loading: boolean;
  error: string | null;
  data: AIAnalysis | null;
}

export interface JudgeProfileHook {
  judgeProfile: JudgeProfileState;
  fetchJudgeProfile: (judgeId: string) => Promise<void>;
  clearError: () => void;
} 