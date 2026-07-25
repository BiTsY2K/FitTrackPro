import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK = 2000; // stay under SecureStore's ~2KB per-value limit
const isWeb = Platform.OS === 'web';

// SecureStore keys may only contain [A-Za-z0-9._-]. Callers pass arbitrary keys
// (e.g. emails, which include `@` and `:`), so encode anything else as `-<hex>-`.
// `-` is the escape marker, so it's encoded too; the chunk suffixes below use `_`
// which never appears in an encoded key, keeping them unambiguous.
function encodeKey(key: string): string {
  return isWeb ? key : key.replace(/[^A-Za-z0-9._]/g, c => `-${c.charCodeAt(0).toString(16)}-`);
}

/** AsyncStorage-compatible adapter backed by the OS keystore, with chunking. */
export const secureStorage = {
  async getItem(rawKey: string): Promise<string | null> {
    if (isWeb) return AsyncStorage.getItem(rawKey);
    const key = encodeKey(rawKey);
    const meta = await SecureStore.getItemAsync(`${key}__n`);
    if (meta == null) return SecureStore.getItemAsync(key); // unchunked value
    const count = parseInt(meta, 10);
    let out = '';
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}__${i}`);
      if (part == null) return null;
      out += part;
    }
    return out;
  },

  async setItem(rawKey: string, value: string): Promise<void> {
    if (isWeb) return AsyncStorage.setItem(rawKey, value);
    const key = encodeKey(rawKey);
    if (value.length <= CHUNK) {
      await SecureStore.setItemAsync(key, value);
      await SecureStore.deleteItemAsync(`${key}__n`).catch(() => undefined);
      return;
    }
    const count = Math.ceil(value.length / CHUNK);
    await SecureStore.setItemAsync(`${key}__n`, String(count));
    for (let i = 0; i < count; i++) {
      await SecureStore.setItemAsync(`${key}__${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK));
    }
  },

  async removeItem(rawKey: string): Promise<void> {
    if (isWeb) return AsyncStorage.removeItem(rawKey);
    const key = encodeKey(rawKey);
    const meta = await SecureStore.getItemAsync(`${key}__n`);
    if (meta) {
      const count = parseInt(meta, 10);
      for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${key}__${i}`);
      await SecureStore.deleteItemAsync(`${key}__n`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};
