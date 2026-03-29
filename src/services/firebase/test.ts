import { initializeFirebase } from '.';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '.';

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');

    initializeFirebase();

    // Test Firestore write //
    const testData = {
      test: true,
      timestamp: new Date(),
      message: 'Hello from FitTrack Pro!',
    };

    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('✅ Firestore write successful:', docRef.id);

    // Test Firestore read //
    const q = query(collection(db, 'test'), where('test', '==', true));
    const querySnapshot = await getDocs(q);
    console.log('✅ Firestore read successful:', querySnapshot.size, 'documents');

    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};
