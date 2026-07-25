/** @type {import("jest").Config} **/
export default {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|firebase|@firebase/.*|@tanstack/.*))',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { statements: 60, branches: 50, functions: 60, lines: 60 },
    './src/lib/': { statements: 80, branches: 75, functions: 80, lines: 80 },
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/services/firebase/test.ts',
    // Firestore rules tests run in Node against the emulator via jest.rules.config.js
    // (npm run test:rules); they must not be picked up by the jest-expo preset.
    '<rootDir>/test/rules/',
  ],
};
