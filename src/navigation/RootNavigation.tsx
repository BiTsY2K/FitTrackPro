import { NavigationContainer, NavigationContainerRef, NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import LandingScreen from '@/screens/LandingScreen';
import { logScreenView } from '@/services/analytics';

import AuthNavigator, { AuthStackParamList } from './AuthNavigation';
import { MainNavigator } from './MainNavigation';
import OnboardingNavigator from './OnboardingNavigation';

export type RootStackParamList = {
  Landing: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const { hasCompletedOnboarding, checkingOnboarding } = useOnboarding();

  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

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
            <>
              <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
            </>
          ) : (
            <Stack.Screen name="Main" component={MainNavigator} />
          )) as React.ReactElement
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
