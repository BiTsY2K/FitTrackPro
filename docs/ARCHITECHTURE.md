# FitTrack Pro - System Architecture

## High-Level Architecture

\`\`\`
┌─────────────────┐
│   React Native  │
│   (Expo)        │
└────────┬────────┘
         │
         ├─ Authentication ────► Firebase Auth
         ├─ Database ──────────► Firestore
         ├─ File Storage ──────► Firebase Storage
         ├─ Cloud Functions ───► Firebase Functions
         ├─ Analytics ─────────► Firebase Analytics
         └─ Error Tracking ────► Sentry
\`\`\`

## Data Flow

1. **User Authentication**
   - Firebase Auth handles email/password, Google, Apple sign-in
   - JWT tokens stored securely in device keychain
   - Automatic token refresh

2. **Data Persistence**
   - Firestore for user profiles, food logs, exercise data
   - Offline persistence enabled (7-day cache)
   - Optimistic UI updates with rollback on failure

3. **File Uploads**
   - Food photos stored in Firebase Storage
   - Compressed before upload (max 1MB)
   - CDN delivery for fast loading

## Security Principles

- All API calls authenticated with Firebase tokens
- Firestore security rules enforce user data isolation
- Environment variables never committed to Git
- HTTPS only in production
- Data encrypted at rest (Firebase default)

## Scalability Considerations

- Firestore indexes created for common queries
- Images served via Firebase CDN
- React Query caching reduces API calls
- Pagination for large datasets