import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { WeightEntry } from '@/types/weight.types';

export const WeightHistoryScreen: React.FC = ({ navigation }: any) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeightHistory();
  }, []);

  const loadWeightHistory = async () => {
    if (!user) return;

    try {
      const q = query(collection(db, 'weight_logs'), where('userId', '==', user.uid), orderBy('date', 'desc'));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate(),
      })) as WeightEntry[];

      setEntries(data);
    } catch (error) {
      console.error('Failed to load weight history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Weight History</Text>

        {entries.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No weight entries yet. Start tracking your progress!</Text>
          </View>
        )}

        <FlatList
          data={entries}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.entry}>
              <Text style={styles.entryDate}>{item.date.toLocaleDateString()}</Text>
              <Text style={styles.entryWeight}>{item.weightKg} kg</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        <Button label="Log Weight" onPress={() => navigation.navigate('LogWeight')} fullWidth />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  entryDate: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },
  entryWeight: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
