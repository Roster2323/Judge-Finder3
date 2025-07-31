import { apiRequest } from './api';

export interface JudgeSearchResult {
  id: number;
  name_first: string;
  name_middle: string;
  name_last: string;
  name_suffix: string;
  slug: string;
  gender: string;
  date_dob: string | null;
  dob_city: string;
  dob_state: string;
  dob_country: string;
  has_photo: boolean;
  fjc_id: string | null;
  positions: any[];
  resource_uri: string;
}

export interface JudgeSearchResponse {
  judges: JudgeSearchResult[];
  total: number;
  next?: string;
  previous?: string;
}

export interface SearchFilters {
  court_type?: string;
  position_type?: string;
  is_active?: boolean;
  state?: string;
  limit?: number;
  offset?: number;
  has_photo?: boolean;
}

export async function searchJudges(query: string, filters: SearchFilters = {}): Promise<JudgeSearchResponse> {
  console.log(`Searching for judges with term: ${query}`, filters);
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (filters.court_type) params.append('court_type', filters.court_type);
    if (filters.position_type) params.append('position_type', filters.position_type);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.state) params.append('state', filters.state);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.has_photo !== undefined) params.append('has_photo', filters.has_photo.toString());
    
    const response = await apiRequest<JudgeSearchResponse>(
      `judges/search-courtlistener?${params.toString()}`
    );
    
    console.log('CourtListener search result:', {
      judges: response.judges?.length || 0,
      total: response.total,
      filters
    });
    
    return response;
  } catch (error) {
    console.error('Failed to search judges:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('Authentication failed')) {
        throw new Error('API authentication failed. Please contact support.');
      }
    }
    
    throw new Error('Failed to search judges. Please try again.');
  }
}

export async function searchJudgesByCourt(courtId: number, limit: number = 20): Promise<JudgeSearchResponse> {
  console.log(`Searching for judges in court: ${courtId}`);
  
  try {
    const response = await apiRequest<JudgeSearchResponse>(
      `judges/search-by-court/${courtId}?limit=${limit}`
    );
    
    console.log('Court search result:', {
      judges: response.judges?.length || 0,
      total: response.total
    });
    
    return response;
  } catch (error) {
    console.error('Failed to search judges by court:', error);
    throw new Error('Failed to search judges by court. Please try again.');
  }
}

export async function getCourts(): Promise<any> {
  try {
    const response = await apiRequest<any>('judges/courts');
    return response;
  } catch (error) {
    console.error('Failed to get courts:', error);
    throw new Error('Failed to get courts. Please try again.');
  }
}

export function formatJudgeName(judge: JudgeSearchResult): string {
  const parts = [
    judge.name_first,
    judge.name_middle,
    judge.name_last,
    judge.name_suffix
  ].filter(Boolean);
  
  return parts.join(' ');
}

export function getCurrentPosition(judge: JudgeSearchResult): any | null {
  if (!judge.positions || judge.positions.length === 0) {
    return null;
  }
  
  // Find the most recent position that hasn't ended
  return judge.positions.find(position => !position.date_termination) || judge.positions[0];
}

export function getActivePositions(judge: JudgeSearchResult): any[] {
  if (!judge.positions || judge.positions.length === 0) {
    return [];
  }
  
  return judge.positions.filter(position => !position.date_termination);
}

export function getCourtName(position: any): string {
  return position.court_name || 'Unknown Court';
}

export function getPositionType(position: any): string {
  return position.position_type || 'Unknown Position';
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Validate if a string looks like a judge ID
 */
export function isValidJudgeId(id: string): boolean {
  return /^\d+$/.test(id);
}

/**
 * Get search suggestions based on common judge names
 */
export function getSearchSuggestions(): string[] {
  return [
    'John Roberts',
    'Sonia Sotomayor',
    'Elena Kagan',
    'Neil Gorsuch',
    'Brett Kavanaugh',
    'Amy Coney Barrett',
    'Ketanji Brown Jackson'
  ];
}

/**
 * Parse search query to extract potential filters
 */
export function parseSearchQuery(query: string): { searchTerm: string; filters: Partial<SearchFilters> } {
  const trimmedQuery = query.trim();
  const filters: Partial<SearchFilters> = {};
  let searchTerm = trimmedQuery;
  
  // Check for court type indicators
  if (trimmedQuery.toLowerCase().includes('federal')) {
    filters.court_type = 'F';
    searchTerm = searchTerm.replace(/\bfederal\b/gi, '').trim();
  } else if (trimmedQuery.toLowerCase().includes('state')) {
    filters.court_type = 'S';
    searchTerm = searchTerm.replace(/\bstate\b/gi, '').trim();
  }
  
  // Check for active/inactive indicators
  if (trimmedQuery.toLowerCase().includes('active')) {
    filters.is_active = true;
    searchTerm = searchTerm.replace(/\bactive\b/gi, '').trim();
  } else if (trimmedQuery.toLowerCase().includes('inactive')) {
    filters.is_active = false;
    searchTerm = searchTerm.replace(/\binactive\b/gi, '').trim();
  }
  
  return { searchTerm, filters };
} 