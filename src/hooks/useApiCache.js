import { useState, useEffect, useRef, useCallback } from 'react';

// Simple in-memory cache with TTL
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes
  }

  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data, expiresAt });
    console.log(`[API Cache] Cached: ${key} (TTL: ${ttl}ms)`);
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      console.log(`[API Cache] Expired: ${key}`);
      return null;
    }

    console.log(`[API Cache] Hit: ${key}`);
    return cached.data;
  }

  invalidate(pattern) {
    const keys = Array.from(this.cache.keys());
    const regex = new RegExp(pattern);
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.delete(key);
        console.log(`[API Cache] Invalidated: ${key}`);
      }
    });
  }

  clear() {
    this.cache.clear();
    console.log('[API Cache] Cleared all cache');
  }
}

const apiCache = new ApiCache();

// API call tracking for debugging
const apiCallTracker = {
  calls: new Map(),
  
  track(endpoint) {
    const count = this.calls.get(endpoint) || 0;
    this.calls.set(endpoint, count + 1);
    console.log(`[API Tracker] ${endpoint}: ${count + 1} calls`);
  },
  
  getStats() {
    return Object.fromEntries(this.calls);
  },
  
  reset() {
    this.calls.clear();
  }
};

// Request queue to prevent concurrent identical requests
class RequestQueue {
  constructor() {
    this.pending = new Map();
  }

  async execute(key, apiCall) {
    // If request is already pending, return the existing promise
    if (this.pending.has(key)) {
      console.log(`[Request Queue] Waiting for pending: ${key}`);
      return this.pending.get(key);
    }

    // Execute the request and cache the promise
    const promise = apiCall().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

const requestQueue = new RequestQueue();

export const useApiCache = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchWithCache = useCallback(async (
    key, 
    apiCall, 
    options = {}
  ) => {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      forceRefresh = false,
      skipCache = false
    } = options;

    // Check cache first (unless force refresh or skip cache)
    if (!forceRefresh && !skipCache) {
      const cached = apiCache.get(key);
      if (cached) {
        return { data: cached, fromCache: true };
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Track API call
      apiCallTracker.track(key);

      // Cancel previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Execute request through queue to prevent duplicates
      const result = await requestQueue.execute(key, async () => {
        const response = await apiCall(abortControllerRef.current.signal);
        return response;
      });

      // Cache the result (unless skip cache)
      if (!skipCache) {
        apiCache.set(key, result, ttl);
      }

      return { data: result, fromCache: false };

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log(`[API Cache] Request aborted: ${key}`);
        return { data: null, aborted: true };
      }
      
      setError(err);
      console.error(`[API Cache] Error for ${key}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateCache = useCallback((pattern) => {
    apiCache.invalidate(pattern);
  }, []);

  const clearCache = useCallback(() => {
    apiCache.clear();
  }, []);

  const getApiStats = useCallback(() => {
    return apiCallTracker.getStats();
  }, []);

  return {
    fetchWithCache,
    invalidateCache,
    clearCache,
    getApiStats,
    loading,
    error
  };
};

export { apiCache, apiCallTracker };