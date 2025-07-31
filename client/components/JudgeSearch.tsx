import React, { useState, useEffect, useCallback } from 'react';
import { searchJudges, searchJudgesByCourt, getCourts, parseSearchQuery, getSearchSuggestions, SearchFilters } from '../lib/judgeSearch';
import { JudgeSearchResult } from '../lib/judgeSearch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Loader2, Search, Filter, MapPin, Users, Calendar, Award, BookOpen, TrendingUp } from 'lucide-react';

interface JudgeSearchProps {
  onJudgeSelect?: (judge: JudgeSearchResult) => void;
  className?: string;
}

export function JudgeSearch({ onJudgeSelect, className }: JudgeSearchProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [judges, setJudges] = useState<JudgeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load courts on component mount
  useEffect(() => {
    loadCourts();
    loadSearchHistory();
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      const response = await fetch('/api/ping');
      if (response.ok) {
        console.log('API health check passed');
      } else {
        console.warn('API health check failed:', response.status);
      }
    } catch (error) {
      console.warn('API health check failed:', error);
    }
  };

  const loadCourts = async () => {
    try {
      const courtsData = await getCourts();
      setCourts(courtsData.results || []);
    } catch (error) {
      console.error('Failed to load courts:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('judgeSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const saveSearchHistory = (searchTerm: string) => {
    const history = searchHistory.filter(term => term !== searchTerm);
    const newHistory = [searchTerm, ...history].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('judgeSearchHistory', JSON.stringify(newHistory));
  };

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    if (!searchQuery.trim()) {
      setJudges([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Parse query for automatic filters
      const { searchTerm, filters: autoFilters } = parseSearchQuery(searchQuery);
      const combinedFilters = { ...searchFilters, ...autoFilters };

      const result = await searchJudges(searchTerm, combinedFilters);
      
      // Ensure we have the expected data structure
      if (result && Array.isArray(result.judges)) {
        setJudges(result.judges);
      } else {
        console.warn('Unexpected API response structure:', result);
        setJudges([]);
      }
      
      // Save to search history
      saveSearchHistory(searchTerm);
    } catch (error) {
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      setJudges([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, filters);
      } else {
        setJudges([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters, performSearch]);

  const handleSearchByCourt = async (courtId: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await searchJudgesByCourt(courtId);
      
      // Ensure we have the expected data structure
      if (result && Array.isArray(result.judges)) {
        setJudges(result.judges);
      } else {
        console.warn('Unexpected court search response structure:', result);
        setJudges([]);
      }
    } catch (error) {
      console.error('Court search failed:', error);
      setError(error instanceof Error ? error.message : 'Court search failed');
      setJudges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJudgeClick = (judge: JudgeSearchResult) => {
    if (onJudgeSelect) {
      onJudgeSelect(judge);
    }
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
  };

  const getCurrentPosition = (judge: JudgeSearchResult) => {
    if (!judge.positions || judge.positions.length === 0) {
      return null;
    }
    return judge.positions.find(position => !position.date_termination) || judge.positions[0];
  };

  const formatJudgeName = (judge: JudgeSearchResult) => {
    const parts = [
      judge.name_first,
      judge.name_middle,
      judge.name_last,
      judge.name_suffix
    ].filter(Boolean);
    return parts.join(' ');
  };

  const getSearchSuggestions = () => {
    const baseSuggestions = [
      'John Roberts',
      'Sonia Sotomayor',
      'Elena Kagan',
      'Neil Gorsuch',
      'Brett Kavanaugh',
      'Amy Coney Barrett',
      'Ketanji Brown Jackson',
      'federal active',
      'state supreme court',
      'district court judge'
    ];
    
    return [...searchHistory, ...baseSuggestions];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Enhanced Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search millions of judges by name, court, or position..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Enhanced Search Suggestions */}
      {query.length > 0 && query.length < 3 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {getSearchSuggestions()
              .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 5)
              .map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {!query && searchHistory.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Recent searches:</p>
          <div className="flex flex-wrap gap-2">
            {searchHistory.slice(0, 5).map((term, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setQuery(term)}
                className="text-xs"
              >
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Advanced Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="court-type">Court Type</Label>
                <Select
                  value={filters.court_type || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, court_type: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All courts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All courts</SelectItem>
                    <SelectItem value="F">Federal Courts</SelectItem>
                    <SelectItem value="S">State Courts</SelectItem>
                    <SelectItem value="A">Appellate Courts</SelectItem>
                    <SelectItem value="D">District Courts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position-type">Position Type</Label>
                <Select
                  value={filters.position_type || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, position_type: value || undefined }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All positions</SelectItem>
                    <SelectItem value="jud">Judge</SelectItem>
                    <SelectItem value="mag">Magistrate Judge</SelectItem>
                    <SelectItem value="bank">Bankruptcy Judge</SelectItem>
                    <SelectItem value="chief">Chief Judge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g., CA, NY, TX"
                  value={filters.state || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value || undefined }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit">Results Limit</Label>
                <Select
                  value={filters.limit?.toString() || '20'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, limit: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 results</SelectItem>
                    <SelectItem value="20">20 results</SelectItem>
                    <SelectItem value="50">50 results</SelectItem>
                    <SelectItem value="100">100 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active-only"
                  checked={filters.is_active === true}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, is_active: checked ? true : undefined }))
                  }
                />
                <Label htmlFor="active-only">Active judges only</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="with-photos"
                  checked={filters.has_photo === true}
                  onCheckedChange={(checked) => 
                    setFilters(prev => ({ ...prev, has_photo: checked ? true : undefined }))
                  }
                />
                <Label htmlFor="with-photos">With photos</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
              <Button onClick={() => setShowFilters(false)} variant="outline" size="sm">
                Hide Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Searching judges...</span>
        </div>
      )}

      {/* Enhanced Search Results */}
      {!loading && judges.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Found {judges.length} judge{judges.length !== 1 ? 's' : ''}
            </h3>
            <Badge variant="secondary">
              {filters.court_type ? `${filters.court_type} Courts` : 'All Courts'}
            </Badge>
          </div>

          <div className="grid gap-4">
            {judges.map((judge) => {
              const currentPosition = getCurrentPosition(judge);
              
              return (
                <Card 
                  key={judge.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleJudgeClick(judge)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {formatJudgeName(judge)}
                        </h4>
                        
                        {currentPosition && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {currentPosition.court_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                {currentPosition.position_type}
                              </span>
                            </div>
                            {currentPosition.date_start && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Since {new Date(currentPosition.date_start).getFullYear()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex gap-2">
                          {judge.positions && judge.positions.length > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              {judge.positions.length} position{judge.positions.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                          {judge.has_photo && (
                            <Badge variant="outline" className="text-xs">
                              📷 Photo
                            </Badge>
                          )}
                          {currentPosition && !currentPosition.date_termination && (
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>

                      {judge.has_photo && (
                        <div className="ml-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 text-sm">📷</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && query && judges.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">No judges found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}

      {/* Enhanced Popular Courts */}
      {!query && !loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Popular Courts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {courts.slice(0, 8).map((court) => (
              <Button
                key={court.id}
                variant="outline"
                onClick={() => handleSearchByCourt(court.id)}
                className="justify-start"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {court.full_name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}