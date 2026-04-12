import { doc, getDoc } from '@firebase/firestore';
import React from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';

interface OnboardingContextValue {
  hasCompletedOnboarding: boolean;
  checkingOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
}

const OnboardingContext = React.createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState<boolean>(false);
  const [checkingOnboarding, setCheckingOnboarding] = React.useState<boolean>(true);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setHasCompletedOnboarding(false);
      setCheckingOnboarding(false);
      return;
    }

    try {
      setCheckingOnboarding(true);
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setHasCompletedOnboarding(!!data.onboardingCompletedAt);
      } else {
        setHasCompletedOnboarding(false);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  React.useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  return (
    <OnboardingContext.Provider value={{ hasCompletedOnboarding, checkingOnboarding, setHasCompletedOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = React.useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
