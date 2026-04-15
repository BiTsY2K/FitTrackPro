import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { ComponentProps } from 'react';

import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { FoodDetailScreen } from '@/screens/food/FoodDetailScreen';
import { FoodSearchScreen } from '@/screens/food/FoodSearchScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { colors } from '@/themes';

export type BottomTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

// ── Navigation param types ── //
export type MainStackParamList = {
  Tabs: undefined;
  FoodSearchScreen: { mealType: string };
  FoodDetail: { food: object; mealType: string };
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

/** Bottom tab navigator */
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

        return <Ionicons name={iconName as ComponentProps<typeof Ionicons>['name']} size={size} color={color} />;
      },

      tabBarActiveTintColor: colors.brand.dim,
      tabBarInactiveTintColor: colors.accent.gray,
      tabBarStyle: { borderTopColor: colors.accent.grayVivid },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{}} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{}} />
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
