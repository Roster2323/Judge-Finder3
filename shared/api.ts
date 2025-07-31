/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */


/**
 * Judge search response
 */
export interface JudgeSearchResponse {
  judges: JudgeSearchResult[];
  total: number;
}

export interface JudgeSearchResult {
  id: number;
  name: string;
  circuit: string;
  tier: "federal" | "state" | "local";
}

/**
 * Judge profile response with full details
 */
export interface JudgeProfileResponse {
  id: number;
  name: string;
  circuit: string;
  tier: "federal" | "state" | "local";
  appointedBy: string;
  yearsOfService: number;
  almaMater: string;
  rulingTendencies: RulingTendency[];
  recentCases: RecentCase[];
  createdAt: string;
  updatedAt: string;
}

export interface RulingTendency {
  id: number;
  judgeId: number;
  category: string;
  percentage: number;
  plaintiffLeans: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentCase {
  id: number;
  judgeId: number;
  title: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User authentication types
 */
export interface LoginRequest {
  email: string;
  name: string;
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    userType: "attorney" | "admin";
  };
  token?: string; // For future JWT implementation
}

export interface RegisterRequest {
  email: string;
  name: string;
  firmName?: string;
  practiceAreas: string[];
  barNumber?: string;
  tier: "federal" | "state" | "local";
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    name: string;
    userType: "attorney" | "admin";
  };
  profile: {
    id: number;
    firmName?: string;
    practiceAreas: string[];
    barNumber?: string;
    verified: boolean;
  };
}

/**
 * Error response type
 */
export interface ErrorResponse {
  error: string;
  message?: string;
}
