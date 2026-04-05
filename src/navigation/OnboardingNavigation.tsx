/* eslint-disable react-native/no-inline-styles */
import { RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { globalStyles } from '@/globalStyles';
import ActivityScreen from '@/screens/onboarding/ActivityScreen';
import { BioDataScreen } from '@/screens/onboarding/BioDataScreen';
import { GoalSelectionScreen } from '@/screens/onboarding/GoalSelectionScreen';
import MeasurementsScreen from '@/screens/onboarding/MeasurementsScreen';
import { PlanSummaryScreen } from '@/screens/onboarding/PlanSummaryScreen';
import { colors, spacing, typography } from '@/themes';
import { OnboardingData } from '@/types/onboarding.types';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, keyof OnboardingStackParamList>;
  route: RouteProp<OnboardingStackParamList, keyof OnboardingStackParamList>;
  showSkip?: boolean;
};

const NavigationHeader: React.FC<Props> = ({ navigation, route, showSkip = true }: Props) => {
  const canGoBack = navigation.canGoBack();

  const goToNextScreen = React.useCallback(() => {
    const current: keyof OnboardingStackParamList = route.name;
    const flowOrder: (keyof OnboardingStackParamList)[] = ['GoalSelection', 'BioData', 'Measurements', 'Activity', 'Summary'];

    const currentIndex = flowOrder.indexOf(current);
    if (currentIndex === -1 || currentIndex >= flowOrder.length - 1) return;

    const nextScreen = flowOrder[currentIndex + 1];
    navigation.navigate(nextScreen, { onboardingData: route.params?.onboardingData ?? undefined });
  }, [navigation, route]);

  return (
    <SafeAreaView style={{ paddingHorizontal: spacing[4] + 1, paddingVertical: spacing[3] }}>
      {/* ── Nav row ── */}
      <View style={[globalStyles.navRow, { columnGap: spacing.lg, marginBottom: 0 }]}>
        {/* Back Button */}
        {canGoBack && (
          <TouchableOpacity style={globalStyles.backBtn} onPress={() => navigation.goBack()}>
            <View style={globalStyles.backCircle}>
              <Text style={globalStyles.backArrow}>←</Text>
              <Text style={globalStyles.backText}>Back</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Logo lockup */}
        <View style={[globalStyles.logoRow, { flex: 1 }]}>
          <LinearGradient colors={[colors.accent.green, colors.accent.purple]} style={globalStyles.logoBadge}>
            <Text style={globalStyles.logoIcon}>⚡</Text>
          </LinearGradient>
          <Text style={[globalStyles.logoText, { fontSize: typography.size.lg }]}>FitTrack PRO</Text>
        </View>

        {/* Skip Button */}
        {showSkip && route.name !== 'Summary' && (
          <TouchableOpacity onPress={() => goToNextScreen()}>
            <Text style={globalStyles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// ── Onboarding Navigator ─────────────────────────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  GoalSelection: { onboardingData?: Partial<OnboardingData> | OnboardingData } | undefined;
  BioData: { onboardingData?: Partial<OnboardingData> | OnboardingData } | undefined;
  Measurements: { onboardingData?: Partial<OnboardingData> | OnboardingData } | undefined;
  Activity: { onboardingData?: Partial<OnboardingData> | OnboardingData } | undefined;
  Summary: { onboardingData?: Partial<OnboardingData> | OnboardingData } | undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="GoalSelection"
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        headerShadowVisible: true,
        headerTransparent: true,
        headerTitle: route.path,
        headerStyle: { backgroundColor: colors.brand.dim },
        animation: 'slide_from_right' as const,
        header: () => <NavigationHeader navigation={navigation} route={route} showSkip={route.name !== 'Summary'} />,
        headerLeft: () => null,
        headerRight: () => null,
      })}
    >
      <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} options={{ title: 'Goal' }} />
      <Stack.Screen name="BioData" component={BioDataScreen} options={{ title: 'Bio' }} />
      <Stack.Screen name="Measurements" component={MeasurementsScreen} options={{ title: 'Measurement' }} />
      <Stack.Screen name="Activity" component={ActivityScreen} options={{ title: 'Activity' }} />
      <Stack.Screen name="Summary" component={PlanSummaryScreen} />
    </Stack.Navigator>
  );
}
