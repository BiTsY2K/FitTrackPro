import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// MMKV is a native (Nitro) module and can't load in Expo Go, so we fall back to
// AsyncStorage there — mirroring the App Check guard in lib/firebase. Both shapes
// satisfy zustand/persist's StateStorage (getItem may be sync or async).
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function createMmkvKv() {
  // Lazy require so the native module is never touched in Expo Go.
  const { createMMKV } = require('react-native-mmkv');
  const mmkv = createMMKV({ id: 'fittrack' });
  return {
    getItem: (k: string) => mmkv.getString(k) ?? null,
    setItem: (k: string, v: string) => mmkv.set(k, v),
    removeItem: (k: string) => mmkv.remove(k),
  };
}

// AsyncStorage-shaped wrapper so zustand/persist can use it.
export const kv = isExpoGo ? AsyncStorage : createMmkvKv();
