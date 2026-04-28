import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { ComponentProps } from 'react';

import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { colors } from '@/themes';
import { FoodItem, MealType } from '@/types/food.types';

export type BottomTabParamList = {
  Dashboard: undefined;
  Profile: undefined;
};

// ── Navigation param types ── //
export type MainStackParamList = {
  Tabs: undefined;
  FoodSearch: { mealType: MealType };
  FoodDetail: { food: FoodItem; mealType: MealType };
  BarcodeScanner: { mealType: MealType };
  ManualFoodEntry: { mealType: MealType };
  RecentFoods: { mealType: MealType };
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

/** Bottom tab navigator */
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: ComponentProps<typeof Ionicons>['name'];
        if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
        else iconName = focused ? 'person' : 'person-outline';

        return <Ionicons name={iconName} size={size} color={color} />;
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

// ── Main Navigator ──────────────────────────────────────────────────────────────────────────────
export const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Tabs" component={TabNavigator} />
    {/* <Stack.Screen name="FoodSearch" component={FoodSearchScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="ManualFoodEntry" component={ManualFoodEntryScreen} options={{ animation: 'slide_from_bottom' }} />
    <Stack.Screen name="RecentFoods" component={RecentFoodsScreen} options={{ animation: 'slide_from_bottom' }} /> */}
  </Stack.Navigator>
);
