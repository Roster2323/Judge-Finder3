import { useState, useCallback } from 'react';
import { judgeProfileService } from '../lib/judgeProfileService';
import { JudgeProfileState, AIAnalysis } from '../types/judge-profile';

export const useJudgeProfile = () => {
  const [state, setState] = useState<JudgeProfileState>({
    loading: false,
    error: null,
    data: null
  });

  const fetchJudgeProfile = useCallback(async (judgeId: string) => {
    // Validate judge ID
    if (!judgeProfileService.validateJudgeId(judgeId)) {
      setState({
        loading: false,
        error: 'Invalid judge ID format',
        data: null
      });
      return;
    }

    // Set loading state
    setState({
      loading: true,
      error: null,
      data: null
    });

    try {
      const data = await judgeProfileService.fetchJudgeProfile(judgeId);
      setState({
        loading: false,
        error: null,
        data
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch judge profile';
      setState({
        loading: false,
        error: errorMessage,
        data: null
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null
    });
  }, []);

  return {
    judgeProfile: state,
    fetchJudgeProfile,
    clearError,
    reset
  };
};

// Hook for basic judge info (without AI analysis)
export const useBasicJudgeInfo = () => {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    data: any | null;
  }>({
    loading: false,
    error: null,
    data: null
  });

  const fetchBasicJudgeInfo = useCallback(async (judgeId: string) => {
    if (!judgeProfileService.validateJudgeId(judgeId)) {
      setState({
        loading: false,
        error: 'Invalid judge ID format',
        data: null
      });
      return;
    }

    setState({
      loading: true,
      error: null,
      data: null
    });

    try {
      const data = await judgeProfileService.fetchBasicJudgeInfo(judgeId);
      setState({
        loading: false,
        error: null,
        data
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch judge info';
      setState({
        loading: false,
        error: errorMessage,
        data: null
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  return {
    basicJudgeInfo: state,
    fetchBasicJudgeInfo,
    clearError
  };
}; 