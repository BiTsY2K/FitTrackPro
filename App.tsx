import { AuthProvider } from '@/contexts/AuthContext';
import RootNavigation from '@/navigation/RootNavigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

export default function App() {
  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
