/**
 * API utility for handling API calls in different environments
 */

// Get the API base URL - use current origin for both dev and production
const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    console.log("API Base URL detected:", origin);
    return origin;
  }
  // Fallback for SSR environments (shouldn't be needed for this app)
  return "";
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Make an API request with proper error handling and retry logic
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  retries = 1,
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`API Request (attempt ${attempt + 1}): ${url}`);

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        let errorDetails = "";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = JSON.stringify(errorData);
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        console.error(`API Error Details:`, {
          url,
          status: response.status,
          statusText: response.statusText,
          errorDetails,
        });
        
        // Handle specific error types
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check API configuration.');
        }
        if (response.status === 404) {
          throw new Error('Resource not found.');
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API Response Data:`, data);
      return data;
    } catch (error) {
      console.error(`API Request failed (attempt ${attempt + 1}):`, error);

      if (attempt === retries) {
        // Last attempt, throw the error
        if (error instanceof TypeError && error.message.includes("fetch")) {
          // Network error - likely the API server is not running or accessible
          throw new Error(
            `Unable to connect to the server at ${url}. Please check if the API server is running and try again.`,
          );
        }
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }

  throw new Error("Maximum retries exceeded");
}

/**
 * Search judges by name using the new Judge Profile API
 * This is a simplified search that returns basic judge info
 */
export async function searchJudges(searchTerm: string) {
  console.log("Searching for judges with term:", searchTerm);
  console.log("Search term length:", searchTerm.length);
  console.log("Encoded search term:", encodeURIComponent(searchTerm));
  
  return apiRequest(`/judges/search?q=${encodeURIComponent(searchTerm)}`);
}

/**
 * Get judge profile by ID using the new Judge Profile API
 */
export async function getJudgeProfile(id: string | number) {
  try {
    // Try the new Judge Profile API first
    const response = await apiRequest(`/judge-profile/${id}`);
    
    // Convert the new API response to the expected format
    return convertJudgeProfileResponse(response);
  } catch (error) {
    console.log('New Judge Profile API failed, trying fallback:', error);
    
    // Fallback to old API
    try {
      return apiRequest(`/judges/${id}`);
    } catch (fallbackError) {
      console.log('Fallback API also failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
}

/**
 * Convert new Judge Profile API response to expected format
 */
function convertJudgeProfileResponse(response: any) {
  return {
    id: response.id,
    name: response.name,
    circuit: response.circuit,
    tier: response.tier,
    appointedBy: response.appointedBy,
    yearsOfService: response.yearsOfService,
    almaMater: response.almaMater,
    rulingTendencies: response.rulingTendencies?.map((tendency: any) => ({
      id: Math.random(), // Generate a random ID
      judgeId: response.id,
      category: tendency.category,
      percentage: tendency.percentage,
      plaintiffLeans: tendency.percentage >= 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) || [],
    recentCases: response.recentCases?.map((case_: any) => ({
      id: case_.id,
      judgeId: response.id,
      title: case_.title,
      case_date: case_.date,
      description: case_.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })) || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get judge profile by name
 */
export async function getJudgeByName(name: string) {
  return apiRequest(`/judges/by-name/${encodeURIComponent(name)}`);
}

/**
 * User login
 */
export async function login(email: string, name: string) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
}

/**
 * User registration with tier selection
 */
export async function register(data: {
  email: string;
  name: string;
  firmName?: string;
  practiceAreas: string[];
  barNumber?: string;
  tier: "federal" | "state" | "local";
  judgeId?: number | null;
}) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Initialize database
 */
export async function initializeDatabase() {
  return apiRequest("/database/init", {
    method: "POST",
  });
}

/**
 * Get attorneys advertising on a judge
 */
export async function getJudgeAttorneys(judgeId: string | number) {
  return apiRequest(`/judges/${judgeId}/attorneys`);
}

/**
 * Get attorney subscriptions
 */
export async function getAttorneySubscriptions(userId: number) {
  return apiRequest(`/subscriptions/${userId}`);
}

/**
 * Cancel attorney subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return apiRequest(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
  });
}
