import { getSentryExpoConfig } from '@sentry/react-native/metro';
import { withUniwindConfig } from 'uniwind/metro';

// Use Sentry's config as the base (it extends the default config internally)
// i.e. getDefaultConfig from 'expo/metro-config';
const config = getSentryExpoConfig(__dirname);

export default withUniwindConfig(config, {
  // relative path to your global.css file (from previous step)
  cssEntryFile: './src/global.css',
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: './src/uniwind-types.d.ts',
});
