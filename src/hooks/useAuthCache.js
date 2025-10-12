import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

export const useAuthCache = () => {
  const { user } = useAuth();
  const { clearUserCache } = useData();

  // Clear cache when user logs in/out
  useEffect(() => {
    if (user) {
      // User just logged in, clear any stale cache
      console.log('[AuthCache] User logged in, clearing cache for fresh data');
      clearUserCache();
    }
  }, [user?.id, clearUserCache]);

  return { clearUserCache };
};