import Constants from 'expo-constants';

export const QUERY_STALE_MS = 1000 * 60 * 5; // 5 min
export const APP_STORE_URL = 'https://fittrack.app';
export const SUPPORT_EMAIL = 'support@fittrack.app';

// In Expo Go / on a device, `localhost` is the phone itself, not the machine
// running the emulators. Metro's host (e.g. "192.168.1.5:8081") is the dev
// machine's LAN IP, so reuse it to reach the emulators. Falls back to localhost
// for the web/iOS-simulator case where they share a loopback.
const metroHost = Constants.expoConfig?.hostUri?.split(':')[0];
export const EMULATOR_HOST = metroHost ?? 'localhost';
export const EMULATOR_PORTS = { auth: 9099, firestore: 8080, functions: 5001, storage: 9199 } as const;
