import { doc, getDoc } from '@firebase/firestore';
import { NavigationContainer, NavigationContainerRef, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import LandingScreen from '@/screens/LandingScreen';
import { logScreenView } from '@/services/analytics';
import { db } from '@/services/firebase';

import AuthNavigator, { AuthStackParamList } from './AuthNavigation';
import { MainNavigator } from './MainNavigation';
import OnboardingNavigator from './OnboardingNavigation';

// ---- Define Param List ---- //
export type RootStackParamList = {
  Landing: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = React.useState(true);

  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setHasCompletedOnboarding(!!data.onboardingCompletedAt);
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  React.useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  // if (loading || checkingOnboarding) {
  //   return null; // Or splash screen
  // }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

        if (previousRouteName !== currentRouteName && currentRouteName) {
          logScreenView(currentRouteName);
        }

        routeNameRef.current = currentRouteName;
      }}
    >
      {/* Your screens */}
      <Stack.Navigator
        initialRouteName={!isAuthenticated ? 'Landing' : !hasCompletedOnboarding ? 'Onboarding' : 'Main'}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {
          (!isAuthenticated ? (
            <>
              <Stack.Screen name="Landing" component={LandingScreen} />
              <Stack.Screen name="Auth" component={AuthNavigator} />
            </>
          ) : !hasCompletedOnboarding ? (
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          ) : (
            <Stack.Screen name="Main" component={MainNavigator} />
          )) as React.ReactElement
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
