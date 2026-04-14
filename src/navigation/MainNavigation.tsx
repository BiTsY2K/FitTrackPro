import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { Colors } from '@/constants/theme';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { FoodDetailScreen } from '@/screens/food/FoodDetailScreen';
import { FoodSearchScreen } from '@/screens/food/FoodSearchScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

// ── Navigation param types ── //
export type MainStackParamList = {
  Tabs: undefined;
  FoodSearchScreen: { mealType: string };
  FoodDetail: { food: object; mealType: string };
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<MainStackParamList>();

/** Bottom tab navigator */
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.primary[400],
      tabBarInactiveTintColor: Colors.gray[400],
      tabBarStyle: {
        borderTopColor: Colors.border,
      },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

// ── Main Navigator ─────────────────────────────────────────────────────────────────────────────
export const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    <Stack.Screen name="FoodSearchScreen" component={FoodSearchScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ animation: 'slide_from_right' }} />
  </Stack.Navigator>
);
