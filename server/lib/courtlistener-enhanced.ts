import axios from 'axios';
import { DatabaseService } from './database';
import { CourtListenerJudge } from '@shared/database';

interface CourtListenerPosition {
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

interface CourtListenerOpinion {
  id: number;
  judge: number;
  cluster: number;
  type: string;
  title: string;
  plain_text: string;
  html: string;
  html_lawbox: string;
  html_columbia: string;
  html_anon_2020: string;
  extracted_by_ocr: boolean;
  author: number;
  joined_by: number[];
  date_created: string;
  date_modified: string;
  date_filed: string;
  absolute_url: string;
  resource_uri: string;
}

interface CourtListenerEducation {
  id: number;
  judge: number;
  school: number;
  school_name: string;
  degree: string;
  degree_year: number;
  date_created: string;
  date_modified: string;
  resource_uri: string;
}

interface CourtListenerABARating {
  id: number;
  judge: number;
  rating: string;
  date_created: string;
  date_modified: string;
  resource_uri: string;
}

interface SearchFilters {
  court_type?: string;
  position_type?: string;
  is_active?: boolean;
  state?: string;
  limit?: number;
  offset?: number;
  has_photo?: boolean;
}

// Simple in-memory cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class CourtListenerEnhancedAPI {
  private baseUrl: string;
  private token: string;

  constructor() {
    // Updated to use v3 API as per documentation
    this.baseUrl = 'https://www.courtlistener.com/api/rest/v3';
    this.token = process.env.COURTLISTENER_TOKEN || process.env.REACT_APP_COURTLISTENER_TOKEN || '';
    
    if (!this.token) {
      console.warn('COURTLISTENER_TOKEN environment variable is not set. API calls will be rate limited.');
    }
  }

  private getCacheKey(endpoint: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  private getCachedResponse(cacheKey: string): any | null {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedResponse(cacheKey: string, data: any): void {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, params);
    
    // Check cache first
    const cached = this.getCachedResponse(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${endpoint}`);
      return cached;
    }

    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString());
      }
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add authentication header if token is available
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 401) {
          throw new Error('Authentication failed. Please check your API token.');
        }
        if (response.status === 404) {
          throw new Error('Resource not found.');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      this.setCachedResponse(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('CourtListener API request failed:', error);
      throw error;
    }
  }

  async searchJudges(query: string, filters: SearchFilters = {}, limit: number = 20): Promise<any> {
    try {
      const params: Record<string, any> = {
        limit,
        ordering: '-date_modified'
      };

      // Enhanced search logic based on CourtListener's approach
      if (query) {
        const trimmedQuery = query.trim();
        
        // Try different search strategies like CourtListener
        if (trimmedQuery.includes(' ')) {
          const nameParts = trimmedQuery.split(' ');
          if (nameParts.length >= 2) {
            // Search by first and last name
            params.name_first__icontains = nameParts[0];
            params.name_last__icontains = nameParts.slice(1).join(' ');
          } else {
            // Single word search - try multiple fields like CourtListener
            params.search = trimmedQuery;
          }
        } else {
          // Single word - search across multiple name fields like CourtListener
          params.search = trimmedQuery;
        }
      }

      // Apply enhanced filters based on CourtListener's approach
      if (filters.court_type) {
        params.positions__court__jurisdiction = filters.court_type;
      }
      
      if (filters.position_type) {
        params.positions__position_type = filters.position_type;
      }
      
      if (filters.is_active !== undefined) {
        if (filters.is_active) {
          params.positions__date_termination__isnull = true;
        } else {
          params.positions__date_termination__isnull = false;
        }
      }
      
      if (filters.state) {
        params.positions__court__state = filters.state;
      }

      if (filters.has_photo !== undefined) {
        params.has_photo = filters.has_photo;
      }

      if (filters.offset) {
        params.offset = filters.offset;
      }

      console.log('Searching with params:', params);

      const result = await this.makeRequest('/people/', params);
      
      // Get positions for each judge like CourtListener does
      const judgesWithPositions = await Promise.all(
        result.results.map(async (judge: any) => {
          try {
            const positions = await this.getJudgePositions(judge.id);
            return {
              ...judge,
              positions: positions.results || []
            };
          } catch (error) {
            console.warn(`Failed to get positions for judge ${judge.id}:`, error);
            return {
              ...judge,
              positions: []
            };
          }
        })
      );

      return {
        judges: judgesWithPositions,
        total: result.count,
        next: result.next,
        previous: result.previous
      };
    } catch (error) {
      console.error('Failed to search judges:', error);
      throw error;
    }
  }

  async getJudgePositions(judgeId: number): Promise<any> {
    return this.makeRequest('/positions/', {
      person: judgeId,
      ordering: '-date_start'
    });
  }

  async getJudgeById(judgeId: number): Promise<any> {
    return this.makeRequest(`/people/${judgeId}/`);
  }

  async getJudgeBySlug(slug: string): Promise<any> {
    return this.makeRequest('/people/', {
      slug,
      limit: 1
    });
  }

  // New method to get judge opinions
  async getJudgeOpinions(judgeId: number, limit: number = 10): Promise<any> {
    return this.makeRequest('/opinions/', {
      author: judgeId,
      ordering: '-date_filed',
      limit
    });
  }

  // New method to get judge education
  async getJudgeEducation(judgeId: number): Promise<any> {
    return this.makeRequest('/educations/', {
      person: judgeId,
      ordering: '-degree_year'
    });
  }

  // New method to get ABA ratings
  async getJudgeABARatings(judgeId: number): Promise<any> {
    return this.makeRequest('/aba-ratings/', {
      person: judgeId,
      ordering: '-date_created'
    });
  }

  // New method to get courts
  async getCourts(): Promise<any> {
    return this.makeRequest('/courts/', {
      ordering: 'full_name'
    });
  }

  // New method to search by court
  async searchJudgesByCourt(courtId: number, limit: number = 20): Promise<any> {
    return this.makeRequest('/people/', {
      positions__court: courtId,
      ordering: '-date_modified',
      limit
    });
  }

  // Clear cache method
  clearCache(): void {
    cache.clear();
    console.log('Cache cleared');
  }
} 