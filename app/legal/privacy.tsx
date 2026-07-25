import { WebView } from 'react-native-webview';

import { env } from '@/config/env';

export default function Privacy() {
  const host = env.APP_ENV === 'production' ? 'https://fittrack.app' : 'http://localhost:5000';
  return <WebView source={{ uri: `${host}/hosting/public/privacy-policy.html` }} />;
}
