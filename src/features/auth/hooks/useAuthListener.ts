import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

import { auth, db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

import { useAuthStore } from '../store';

export function useAuthListener() {
  const set = useAuthStore(s => s.set);
  const reset = useAuthStore(s => s.reset);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      try {
        if (!user) {
          reset();
          set({ status: 'unauthed' });
          return;
        }

        const token = await user.getIdTokenResult(true); // force refresh → fresh claims + verified
        const profileSnap = await getDoc(doc(db, `users/${user.uid}/profile/main`)).catch(() => null);
        set({
          status: 'authed',
          user: { uid: user.uid, email: user.email, displayName: user.displayName },
          emailVerified: user.emailVerified,
          profileComplete: !!profileSnap?.exists(),
          claims: {
            premium: token.claims.premium === true,
            admin: token.claims.admin === true,
          },
        });
      } catch (error) {
        logger.error('auth_listener_failed', { error });
        set({ status: 'unauthed' });
      }
    });
    return unsub;
  }, [set, reset]);
}
