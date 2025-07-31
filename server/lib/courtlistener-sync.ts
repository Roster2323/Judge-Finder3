import axios from 'axios';
import { DatabaseService } from './database';
import { CourtListenerJudge } from '@shared/database';

interface CourtListenerApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CourtListenerJudge[];
}

export class CourtListenerSync {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl = 'https://www.courtlistener.com/api/rest/v4';
    this.token = process.env.COURTLISTENER_TOKEN || process.env.REACT_APP_COURTLISTENER_TOKEN || '';
    
    if (!this.token) {
      throw new Error('COURTLISTENER_TOKEN environment variable is required');
    }
  }

  /**
   * Fetch judges from CourtListener API and sync to database
   */
  async syncJudges(limit: number = 100, offset: number = 0): Promise<void> {
    try {
      console.log(`Syncing judges from CourtListener API (limit: ${limit}, offset: ${offset})`);
      
      const response = await axios.get<CourtListenerApiResponse>(
        `${this.baseUrl}/people/`,
        {
          params: {
            limit,
            offset,
            format: 'json'
          },
          headers: {
            'Authorization': `Token ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const judges = response.data.results;
      console.log(`Fetched ${judges.length} judges from CourtListener API`);

      // Transform and insert judges
      for (const judge of judges) {
        await this.insertJudge(judge);
      }

      console.log(`Successfully synced ${judges.length} judges to database`);
      
      // Return next page info if available
      if (response.data.next) {
        const nextOffset = offset + limit;
        console.log(`Next page available at offset: ${nextOffset}`);
        return this.syncJudges(limit, nextOffset);
      }
    } catch (error) {
      console.error('Error syncing judges from CourtListener:', error);
      throw error;
    }
  }

  /**
   * Insert a single judge into the database
   */
  private async insertJudge(judgeData: any): Promise<void> {
    try {
      const transformedJudge: Partial<CourtListenerJudge> = {
        id: judgeData.id,
        dateCreated: judgeData.date_created,
        dateModified: judgeData.date_modified,
        dateCompleted: judgeData.date_completed,
        fjcId: judgeData.fjc_id,
        slug: judgeData.slug,
        nameFirst: judgeData.name_first,
        nameMiddle: judgeData.name_middle,
        nameLast: judgeData.name_last,
        nameSuffix: judgeData.name_suffix,
        dateDob: judgeData.date_dob,
        dateGranularityDob: judgeData.date_granularity_dob,
        dateDod: judgeData.date_dod,
        dateGranularityDod: judgeData.date_granularity_dod,
        dobCity: judgeData.dob_city,
        dobState: judgeData.dob_state,
        dobCountry: judgeData.dob_country,
        dodCity: judgeData.dod_city,
        dodState: judgeData.dod_state,
        dodCountry: judgeData.dod_country,
        gender: judgeData.gender,
        religion: judgeData.religion,
        ftmTotalReceived: judgeData.ftm_total_received,
        ftmEid: judgeData.ftm_eid,
        hasPhoto: judgeData.has_photo,
        isAliasOfId: judgeData.is_alias_of
      };

      await DatabaseService.upsertCourtListenerJudge(transformedJudge);
    } catch (error) {
      console.error(`Error inserting judge ${judgeData.id}:`, error);
      // Continue with other judges even if one fails
    }
  }

  /**
   * Search for a specific judge by name and sync if found
   */
  async searchAndSyncJudge(searchTerm: string): Promise<CourtListenerJudge | null> {
    try {
      console.log(`Searching for judge: ${searchTerm}`);
      
      // Try multiple search strategies
      const searchParams: any = {
        format: 'json',
        limit: 10
      };
      
      // Add search parameters based on the term
      if (searchTerm.includes(' ')) {
        const [firstName, ...lastNameParts] = searchTerm.split(' ');
        const lastName = lastNameParts.join(' ');
        searchParams.name_first__icontains = firstName;
        searchParams.name_last__icontains = lastName;
      } else {
        // Single term - search both first and last name
        searchParams.name_first__icontains = searchTerm;
        searchParams.name_last__icontains = searchTerm;
      }
      
      const response = await axios.get<CourtListenerApiResponse>(
        `${this.baseUrl}/people/`,
        {
          params: searchParams,
          headers: {
            'Authorization': `Token ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const judges = response.data.results;
      
      if (judges.length > 0) {
        // Insert the first matching judge
        await this.insertJudge(judges[0]);
        const judge = judges[0] as any; // Cast as any since the API response uses snake_case
        console.log(`Synced judge: ${judge.name_first} ${judge.name_last}`);
        return judge;
      }

      return null;
    } catch (error) {
      console.error('Error searching and syncing judge:', error);
      return null;
    }
  }
}

// CLI script for syncing judges
if (require.main === module) {
  const sync = new CourtListenerSync();
  
  const command = process.argv[2];
  const searchTerm = process.argv[3];
  
  if (command === 'sync') {
    const limit = parseInt(process.argv[4]) || 100;
    sync.syncJudges(limit, 0)
      .then(() => {
        console.log('Sync completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Sync failed:', error);
        process.exit(1);
      });
  } else if (command === 'search' && searchTerm) {
    sync.searchAndSyncJudge(searchTerm)
      .then((judge) => {
        if (judge) {
          console.log('Judge found and synced:', judge);
        } else {
          console.log('No judge found');
        }
        process.exit(0);
      })
      .catch((error) => {
        console.error('Search failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  node courtlistener-sync.js sync [limit]');
    console.log('  node courtlistener-sync.js search "Judge Name"');
    process.exit(1);
  }
} 