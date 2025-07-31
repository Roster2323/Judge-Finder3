import express from 'express';
import { CourtListenerEnhancedAPI } from '../lib/courtlistener-enhanced';

const router = express.Router();
const courtListenerAPI = new CourtListenerEnhancedAPI();

// Search judges endpoint with enhanced filters
router.get('/search-courtlistener', async (req, res) => {
  try {
    const { 
      q: query, 
      limit = 20,
      court_type,
      position_type,
      is_active,
      state,
      offset
    } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    console.log(`Searching for judges with term: ${query}`);
    
    // Build filters object
    const filters: any = {};
    if (court_type) filters.court_type = court_type;
    if (position_type) filters.position_type = position_type;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    if (state) filters.state = state;
    if (offset) filters.offset = parseInt(offset as string);
    
    const result = await courtListenerAPI.searchJudges(query, filters, Number(limit));
    
    console.log(`CourtListener search result:`, {
      judges: result.judges?.length || 0,
      total: result.total,
      filters
    });

    res.json({
      judges: result.judges || [],
      total: result.total || 0,
      next: result.next,
      previous: result.previous
    });
  } catch (error) {
    console.error('Error searching judges:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Rate limit')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.',
          message: error.message 
        });
      }
      if (error.message.includes('Authentication failed')) {
        return res.status(401).json({ 
          error: 'Authentication failed. Please check API configuration.',
          message: error.message 
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to search judges',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get judge by ID endpoint with enhanced data
router.get('/judge/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const judgeId = parseInt(id);
    
    if (isNaN(judgeId)) {
      return res.status(400).json({ error: 'Invalid judge ID' });
    }

    // Get judge data, positions, opinions, education, and ABA ratings
    const [judge, positions, opinions, education, abaRatings] = await Promise.allSettled([
      courtListenerAPI.getJudgeById(judgeId),
      courtListenerAPI.getJudgePositions(judgeId),
      courtListenerAPI.getJudgeOpinions(judgeId, 5), // Get recent opinions
      courtListenerAPI.getJudgeEducation(judgeId),
      courtListenerAPI.getJudgeABARatings(judgeId)
    ]);
    
    const judgeData = judge.status === 'fulfilled' ? judge.value : null;
    const positionsData = positions.status === 'fulfilled' ? positions.value.results || [] : [];
    const opinionsData = opinions.status === 'fulfilled' ? opinions.value.results || [] : [];
    const educationData = education.status === 'fulfilled' ? education.value.results || [] : [];
    const abaRatingsData = abaRatings.status === 'fulfilled' ? abaRatings.value.results || [] : [];
    
    if (!judgeData) {
      return res.status(404).json({ error: 'Judge not found' });
    }
    
    res.json({
      judge: judgeData,
      positions: positionsData,
      opinions: opinionsData,
      education: educationData,
      abaRatings: abaRatingsData
    });
  } catch (error) {
    console.error('Error fetching judge:', error);
    
    if (error instanceof Error && error.message.includes('404')) {
      return res.status(404).json({ error: 'Judge not found' });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch judge',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get judge by slug endpoint
router.get('/judge/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug parameter is required' });
    }

    const result = await courtListenerAPI.getJudgeBySlug(slug);
    
    if (!result.results || result.results.length === 0) {
      return res.status(404).json({ error: 'Judge not found' });
    }

    const judge = result.results[0];
    const positions = await courtListenerAPI.getJudgePositions(judge.id);
    
    res.json({
      judge,
      positions: positions.results || []
    });
  } catch (error) {
    console.error('Error fetching judge by slug:', error);
    res.status(500).json({ 
      error: 'Failed to fetch judge',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get courts endpoint
router.get('/courts', async (req, res) => {
  try {
    const courts = await courtListenerAPI.getCourts();
    res.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch courts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search judges by court
router.get('/search-by-court/:courtId', async (req, res) => {
  try {
    const { courtId } = req.params;
    const { limit = 20 } = req.query;
    
    const courtIdNum = parseInt(courtId);
    if (isNaN(courtIdNum)) {
      return res.status(400).json({ error: 'Invalid court ID' });
    }

    const result = await courtListenerAPI.searchJudgesByCourt(courtIdNum, Number(limit));
    
    res.json({
      judges: result.results || [],
      total: result.count || 0,
      next: result.next,
      previous: result.previous
    });
  } catch (error) {
    console.error('Error searching judges by court:', error);
    res.status(500).json({ 
      error: 'Failed to search judges by court',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear cache endpoint (for development)
router.post('/clear-cache', async (req, res) => {
  try {
    courtListenerAPI.clearCache();
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
