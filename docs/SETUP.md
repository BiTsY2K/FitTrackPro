# FitTrack Pro - Developer Setup Guide

## Prerequisites
- Node.js 20+
- npm or yarn
- Expo CLI
- Git
- iOS Simulator (Mac) or Android Studio

## Quick Start
1. Clone repository
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/FitTrackPro.git
   cd FitTrackPro
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Copy environment file
   \`\`\`bash
   cp .env.development .env
   \`\`\`

4. Start development server
   \`\`\`bash
   npm start
   \`\`\`

## Available Scripts
- \`npm start\` - Start Expo dev server
- \`npm run ios\` - Start iOS simulator
- \`npm run android\` - Start Android emulator
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript compiler
- \`npm test\` - Run tests

## Project Structure
See ARCHITECTURE.md for detailed structure.