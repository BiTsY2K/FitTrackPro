import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

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
          const profileData = docSnap.data() as UserProfile;

          // Reset broken streak if today is past the lastLogDate's yesterday
          if ((profileData.currentStreak ?? 0) > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];

            if (!profileData.lastLogDate || (profileData.lastLogDate !== today && profileData.lastLogDate !== yesterday)) {
              profileData.currentStreak = 0;
              updateDoc(docRef, { currentStreak: 0 }).catch(err => {
                logger.error('Failed to reset broken streak in Firestore', err);
              });
            }
          }

          return profileData;
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
