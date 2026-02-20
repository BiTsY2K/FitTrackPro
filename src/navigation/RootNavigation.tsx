import React, { useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { logScreenView } from '@/services/analytics';
import SignInScreen from '@/screens/auth/SignInScreen';
import LandingScreen from '@/screens/LandingScreen';
import SignUpScreen from '@/screens/auth/SignUpScreen';

// ---- Define Param List ----
export type RootStackParamList = {
  Landing: undefined;
  Profile: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigation() {
  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<NavigationContainerRef<ReactNavigation.RootParamList>>(null);

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
        initialRouteName="Landing"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
