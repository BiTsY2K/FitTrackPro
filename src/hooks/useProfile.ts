import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { UserProfile } from '@/types/users.types';
import { logger } from '@/utils/logger';

const PROFILE_QUERY_KEY = 'userProfile';

/**
 * Shared user profile hook with react-query caching
 *
 * Single source of truth for the user profile — any screen that imports
 * this gets the same cached copy, avoiding redundant Firestore reads.
 */
export const useProfile = () => {
  const { user } = useAuth();

  const {
    data: profile,
    isLoading,
    refetch,
  } = useQuery<UserProfile | null>({
    queryKey: [PROFILE_QUERY_KEY, user?.uid],
    queryFn: async () => {
      if (!user) return null;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
        return null;
      } catch (error) {
        logger.error('Failed to load user profile', error as Error);
        return null;
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute — profile doesn't change often
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    profile: profile ?? null,
    isLoading,
    refetch,
  };
};
