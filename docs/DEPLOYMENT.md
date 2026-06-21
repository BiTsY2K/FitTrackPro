# Deployment Guide

## Development Build

\`\`\`bash

# Start local dev server

npm start

# Run on iOS simulator

npm run ios

# Run on Android emulator

npm run android
\`\`\`

## Preview Build (Internal Testing)

\`\`\`bash

# Build preview for iOS + Android

eas build --platform all --profile preview

# Wait for build to complete (~10-15 min)

# Download and install on device

\`\`\`

## Production Build

\`\`\`bash

# Build production for both platforms

eas build --platform all --profile production

# Submit to App Store

eas submit --platform ios

# Submit to Google Play

eas submit --platform android
\`\`\`

## Environment Variables

### Development

- Edit \`.env.development\`
- Restart Expo: \`npm start --reset-cache\`

### Production

- Edit \`.env.production\`
- Rebuild app: \`eas build --profile production\`

## Troubleshooting

### "Firebase not initialized"

1. Verify .env file exists
2. Check all FIREBASE\_\* variables are set
3. Restart with cache clear: \`npm start --reset-cache\`

### "Build failed on EAS"

1. Check \`eas build:list\` for error logs
2. Verify all secrets set in Expo dashboard
3. Check app.json bundle IDs match Firebase
   \`\`\`

---
