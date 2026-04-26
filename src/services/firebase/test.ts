import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { initializeFirebase } from '.';
import { db } from '.';

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');
    initializeFirebase();

    const testData = { test: true, timestamp: new Date(), message: 'Hello from FitTrack Pro!' }; // Test Firestore write

    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('✅ Firestore write successful:', docRef.id);

    const q = query(collection(db, 'test'), where('test', '==', true)); // Test Firestore read
    const querySnapshot = await getDocs(q);
    console.log('✅ Firestore read successful:', querySnapshot.size, 'documents');

    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};
