import React, { createContext, useContext, useState, useCallback } from 'react';
import { useApiCache } from '../hooks/useApiCache.js';
import { userAPI, resultsAPI, interviewAPI } from '../services/api.jsx';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { fetchWithCache, invalidateCache, clearCache, getApiStats } = useApiCache();
  const [globalLoading, setGlobalLoading] = useState(false);

  // Centralized data fetching functions
  const fetchDashboardData = useCallback(async (options = {}) => {
    const { page = 1, limit = 5, forceRefresh = false } = options;
    
    console.log('[DataContext] Fetching dashboard data...');
    setGlobalLoading(true);

    try {
      // Use Promise.allSettled to prevent one failure from breaking everything
      const [interviewsResult, analyticsResult, interviewStatsResult] = await Promise.allSettled([
        fetchWithCache(
          `interviews-page-${page}-limit-${limit}`,
          () => interviewAPI.getAll({ limit, page, sort: '-createdAt' }),
          { forceRefresh, ttl: 2 * 60 * 1000 } // 2 minutes for interviews
        ),
        fetchWithCache(
          'analytics-performance',
          () => resultsAPI.getAnalytics(),
          { forceRefresh, ttl: 5 * 60 * 1000 } // 5 minutes for analytics
        ),
        fetchWithCache(
          'interview-stats-overview',
          () => interviewAPI.getStats(),
          { forceRefresh, ttl: 5 * 60 * 1000 } // 5 minutes for stats
        )
      ]);

      const result = {
        interviews: interviewsResult.status === 'fulfilled' ? interviewsResult.value.data : null,
        analytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : null,
        interviewStats: interviewStatsResult.status === 'fulfilled' ? interviewStatsResult.value.data : null,
        errors: {
          interviews: interviewsResult.status === 'rejected' ? interviewsResult.reason : null,
          analytics: analyticsResult.status === 'rejected' ? analyticsResult.reason : null,
          interviewStats: interviewStatsResult.status === 'rejected' ? interviewStatsResult.reason : null,
        }
      };

      console.log('[DataContext] Dashboard data loaded successfully');
      return result;

    } catch (error) {
      console.error('[DataContext] Failed to load dashboard data:', error);
      throw error;
    } finally {
      setGlobalLoading(false);
    }
  }, [fetchWithCache]);

  const fetchProfileAnalytics = useCallback(async (forceRefresh = false) => {
    console.log('[DataContext] Fetching profile analytics...');
    
    try {
      const [analyticsResult, interviewsResult] = await Promise.allSettled([
        fetchWithCache(
          'analytics-performance',
          () => resultsAPI.getAnalytics(),
          { forceRefresh, ttl: 5 * 60 * 1000 }
        ),
        fetchWithCache(
          'user-interviews-all',
          () => userAPI.getInterviews({ limit: 50 }),
          { forceRefresh, ttl: 3 * 60 * 1000 }
        )
      ]);

      return {
        analytics: analyticsResult.status === 'fulfilled' ? analyticsResult.value.data : null,
        interviews: interviewsResult.status === 'fulfilled' ? interviewsResult.value.data : null,
        errors: {
          analytics: analyticsResult.status === 'rejected' ? analyticsResult.reason : null,
          interviews: interviewsResult.status === 'rejected' ? interviewsResult.reason : null,
        }
      };

    } catch (error) {
      console.error('[DataContext] Failed to load profile analytics:', error);
      throw error;
    }
  }, [fetchWithCache]);

  const fetchInterviewHistory = useCallback(async (params = {}, forceRefresh = false) => {
    const { limit = 20, status, sort = '-createdAt' } = params;
    const cacheKey = `interview-history-${JSON.stringify(params)}`;
    
    console.log('[DataContext] Fetching interview history...');
    
    try {
      const [interviewsResult, resultsResult] = await Promise.allSettled([
        fetchWithCache(
          cacheKey,
          () => interviewAPI.getAll({ limit, status, sort }),
          { forceRefresh, ttl: 3 * 60 * 1000 }
        ),
        fetchWithCache(
          'user-results-all',
          () => resultsAPI.getAll({ sort: '-createdAt', limit: 50 }),
          { forceRefresh, ttl: 3 * 60 * 1000 }
        )
      ]);

      return {
        interviews: interviewsResult.status === 'fulfilled' ? interviewsResult.value.data : null,
        results: resultsResult.status === 'fulfilled' ? resultsResult.value.data : null,
        errors: {
          interviews: interviewsResult.status === 'rejected' ? interviewsResult.reason : null,
          results: resultsResult.status === 'rejected' ? resultsResult.reason : null,
        }
      };

    } catch (error) {
      console.error('[DataContext] Failed to load interview history:', error);
      throw error;
    }
  }, [fetchWithCache]);

  // Cache invalidation helpers
  const invalidateInterviewData = useCallback(() => {
    invalidateCache('interviews.*');
    invalidateCache('interview-stats.*');
    console.log('[DataContext] Invalidated interview data cache');
  }, [invalidateCache]);

  const invalidateAnalyticsData = useCallback(() => {
    invalidateCache('analytics.*');
    console.log('[DataContext] Invalidated analytics data cache');
  }, [invalidateCache]);

  const invalidateAllData = useCallback(() => {
    clearCache();
    console.log('[DataContext] Cleared all cached data');
  }, [clearCache]);

  // Debug helper
  const getDebugInfo = useCallback(() => {
    return {
      apiStats: getApiStats(),
      globalLoading
    };
  }, [getApiStats, globalLoading]);

  const value = {
    // Data fetching functions
    fetchDashboardData,
    fetchProfileAnalytics,
    fetchInterviewHistory,
    
    // Cache management
    invalidateInterviewData,
    invalidateAnalyticsData,
    invalidateAllData,
    
    // State
    globalLoading,
    
    // Debug
    getDebugInfo
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};