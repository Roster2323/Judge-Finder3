// CourtListener API Response Types
export interface CourtListenerJudge {
  id: number;
  name_full: string;
  name_first: string;
  name_last: string;
  name_middle: string;
  name_suffix: string;
  date_dob: string | null;
  date_dod: string | null;
  gender: string;
  is_alias_of: number | null;
  date_created: string;
  date_modified: string;
  fjc_id: number | null;
  resource_uri: string;
  detail?: string; // For error responses
}

export interface CourtListenerPosition {
  id: number;
  judge: number;
  position_type: string;
  court: number;
  court_name: string;
  court_type: string;
  date_start: string;
  date_termination: string;
  date_created: string;
  date_modified: string;
  resource_uri: string;
}

export interface CourtListenerOpinion {
  id: number;
  absolute_url: string;
  cluster: number;
  date_created: string;
  date_modified: string;
  date_filed: string;
  html: string;
  html_lawbox: string;
  html_columbia: string;
  html_anon_2020: string;
  plain_text: string;
  html_with_citations: string;
  extracted_by_ocr: boolean;
  author: number;
  author_str: string;
  joined_by: number[];
  type: string;
  sha1: string;
  download_url: string;
  local_path: string;
  per_curiam: boolean;
  resource_uri: string;
}

export interface CourtListenerPositionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerPosition[];
}

export interface CourtListenerOpinionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerOpinion[];
}

// Merged Judge Data
export interface MergedJudgeData {
  judge: CourtListenerJudge;
  positions: CourtListenerPositionsResponse;
  opinions: CourtListenerOpinionsResponse;
}

// AI Analysis Response
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

// Final API Response
export interface JudgeProfileResponse {
  judge: {
    id: string;
    name: string;
    court: string;
    positions: CourtListenerPosition[];
    recentOpinions: CourtListenerOpinion[];
  };
  analysis: AIAnalysis;
}

// Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  success: boolean;
}

// API Configuration
export interface CourtListenerConfig {
  baseUrl: string;
  token: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
} 