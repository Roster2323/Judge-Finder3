/**
 * N8N Judge Finder API Integration
 * Handles communication with the N8N workflow for judge profile data
 */

// N8N API Configuration
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://rosterkamp.app.n8n.cloud';
const JUDGE_API_ENDPOINT = `${N8N_BASE_URL}/webhook/judge-profile`;

/**
 * Judge Profile Response from N8N Workflow
 */
export interface N8nJudgeProfileResponse {
  id: number;
  name: string;
  circuit: string;
  tier: "federal" | "state" | "local";
  appointedBy: string;
  yearsOfService: string;
  almaMater: string;
  rulingTendencies: N8nRulingTendency[];
  recentCases: N8nRecentCase[];
  summary: string;
  courtroomExpectations: string;
  success: boolean;
  lastUpdated: string;
}

export interface N8nRulingTendency {
  category: string;
  percentage: number;
  description: string;
}

export interface N8nRecentCase {
  id: number;
  title: string;
  date: string;
  description: string;
}

export interface N8nErrorResponse {
  error: string;
  message: string;
  success: false;
}

/**
 * Fetch judge profile from N8N workflow
 */
export async function fetchJudgeProfileFromN8n(judgeId: string | number): Promise<N8nJudgeProfileResponse> {
  const url = `${JUDGE_API_ENDPOINT}/${judgeId}`;
  
  console.log(`Fetching judge profile from N8N: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for long-running AI analysis
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log(`N8N Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails = "";
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = JSON.stringify(errorData);
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error(`N8N API Error Details:`, {
        url,
        status: response.status,
        statusText: response.statusText,
        errorDetails,
      });
      
      throw new Error(errorMessage);
    }

    const judgeProfile = await response.json();

    // Validate response structure
    if (!judgeProfile.success && judgeProfile.success !== undefined) {
      throw new Error(judgeProfile.message || 'Failed to fetch judge profile');
    }

    // Ensure arrays exist to prevent undefined errors
    judgeProfile.rulingTendencies = judgeProfile.rulingTendencies || [];
    judgeProfile.recentCases = judgeProfile.recentCases || [];

    return judgeProfile;
  } catch (error) {
    console.error('N8N Judge API Error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Unable to connect to the N8N workflow at ${url}. Please check if the workflow is active and try again.`
      );
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'Request timed out. The AI analysis is taking longer than expected. Please try again.'
      );
    }
    
    throw error;
  }
}

/**
 * Convert N8N response to match existing JudgeProfileResponse interface
 */
export function convertN8nResponseToJudgeProfile(n8nResponse: N8nJudgeProfileResponse) {
  return {
    id: n8nResponse.id,
    name: n8nResponse.name,
    circuit: n8nResponse.circuit,
    tier: n8nResponse.tier,
    appointedBy: n8nResponse.appointedBy,
    yearsOfService: parseInt(n8nResponse.yearsOfService) || 0,
    almaMater: n8nResponse.almaMater,
    rulingTendencies: n8nResponse.rulingTendencies.map(tendency => ({
      id: 0, // N8N doesn't provide IDs
      judgeId: n8nResponse.id,
      category: tendency.category,
      percentage: tendency.percentage,
      plaintiffLeans: tendency.percentage > 50,
      createdAt: n8nResponse.lastUpdated,
      updatedAt: n8nResponse.lastUpdated,
    })),
    recentCases: n8nResponse.recentCases.map(case_ => ({
      id: case_.id,
      judgeId: n8nResponse.id,
      title: case_.title,
      date: case_.date,
      description: case_.description,
      createdAt: n8nResponse.lastUpdated,
      updatedAt: n8nResponse.lastUpdated,
    })),
    createdAt: n8nResponse.lastUpdated,
    updatedAt: n8nResponse.lastUpdated,
  };
}

/**
 * Test N8N workflow connectivity
 */
export async function testN8nConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('N8N connection test failed:', error);
    return false;
  }
} 