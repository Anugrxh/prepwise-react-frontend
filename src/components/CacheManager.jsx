import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useData } from '../contexts/DataContext.jsx';

const CacheManager = () => {
  const { user } = useAuth();
  const { clearUserCache } = useData();
  const previousUserRef = useRef(null);

  useEffect(() => {
    const currentUserId = user?.id;
    const previousUserId = previousUserRef.current?.id;

    // Clear cache when user changes (login/logout/switch user)
    if (currentUserId !== previousUserId) {
      console.log('[CacheManager] User changed, clearing cache');
      console.log('Previous user:', previousUserId);
      console.log('Current user:', currentUserId);
      
      clearUserCache();
      
      // Update the ref to track the current user
      previousUserRef.current = user;
    }
  }, [user, clearUserCache]);

  // This component doesn't render anything
  return null;
};

export default CacheManager;