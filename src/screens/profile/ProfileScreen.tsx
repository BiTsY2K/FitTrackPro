import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { BottomTabParamList, MainStackParamList } from '@/navigation/MainNavigation';
import { db } from '@/services/firebase';
import { UserProfile } from '@/types/users.types';

type Props = CompositeScreenProps<BottomTabScreenProps<BottomTabParamList, 'Profile'>, NativeStackScreenProps<MainStackParamList>>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={Colors.primary[400]} />
          </View>
          <Text style={styles.name}>{profile?.displayName || user?.email}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Current Plan */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Plan</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Calories</Text>
            <Text style={styles.statValue}>{profile?.nutritionPlan?.dailyMacroTargets.dailyCalorieTarget} kcal</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Protein</Text>
            <Text style={styles.statValue}>{profile?.nutritionPlan?.dailyMacroTargets.dailyProteinGrams}g</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Carbs</Text>
            <Text style={styles.statValue}>{profile?.nutritionPlan?.dailyMacroTargets.dailyCarbsGrams}g</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Fat</Text>
            <Text style={styles.statValue}>{profile?.nutritionPlan?.dailyMacroTargets.dailyFatGrams}g</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.card}>
          <Pressable style={styles.menuItem} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={24} color={Colors.primary[400]} />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('ChangeGoal')}>
            <Ionicons name="flag" size={24} color={Colors.primary[400]} />
            <Text style={styles.menuText}>Change Goal</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('WeightHistory')}>
            <Ionicons name="analytics" size={24} color={Colors.primary[400]} />
            <Text style={styles.menuText}>Weight History</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
          </Pressable>
        </View>

        {/* Account */}
        <View style={styles.card}>
          <Pressable style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings" size={24} color={Colors.gray[600]} />
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleSignOut}>
            <Ionicons name="log-out" size={24} color={Colors.error} />
            <Text style={[styles.menuText, styles.menuTextDanger]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.gray[400]} />
          </Pressable>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  menuTextDanger: {
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xl,
  },
});
