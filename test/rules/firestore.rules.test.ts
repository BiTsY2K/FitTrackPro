import { readFileSync } from 'node:fs';

import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'fittrack-rules-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

it('lets a user read their own profile', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(alice, 'users/alice/profile/main'), { heightCm: 170 }));
  await assertSucceeds(getDoc(doc(alice, 'users/alice/profile/main')));
});

it('denies reading another user document', async () => {
  const bob = testEnv.authenticatedContext('bob').firestore();
  await assertFails(getDoc(doc(bob, 'users/alice/profile/main')));
});

it('denies unauthenticated access', async () => {
  const anon = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon, 'users/alice/profile/main')));
});

it('denies client writes to server-only config', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(setDoc(doc(alice, 'config/flags'), { social_feed: true }));
});

it('denies any client access to authAttempts', async () => {
  const alice = testEnv.authenticatedContext('alice').firestore();
  await assertFails(getDoc(doc(alice, 'authAttempts/somehash')));
  await assertFails(setDoc(doc(alice, 'authAttempts/somehash'), { count: 0 }));
});
