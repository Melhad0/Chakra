import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBkvD26MP6svfUKszeu_4-Iogdf4hv1UTs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'chakracliker.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://chakracliker-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'chakracliker',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'chakracliker.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '302122071505',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:302122071505:web:ba1a99415ad06d1f549cf0',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const rtdb = getDatabase(app);
