// filepath: frontend/src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { readOptionalEnv } from '../utils/env';

const firebaseConfig = {
  apiKey: readOptionalEnv('VITE_FIREBASE_API_KEY', ''),
  authDomain: readOptionalEnv('VITE_FIREBASE_AUTH_DOMAIN', ''),
  projectId: readOptionalEnv('VITE_FIREBASE_PROJECT_ID', ''),
  storageBucket: readOptionalEnv('VITE_FIREBASE_STORAGE_BUCKET', ''),
  messagingSenderId: readOptionalEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', ''),
  appId: readOptionalEnv('VITE_FIREBASE_APP_ID', '')
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);

let firebaseApp = null;
let firebaseAuth = null;

if (hasFirebaseConfig) {
  firebaseApp = initializeApp(firebaseConfig);
  firebaseAuth = getAuth(firebaseApp);
} else {
  console.warn('[Firebase] Missing VITE_FIREBASE_* config. Auth features are disabled.');
}

export { firebaseApp, firebaseAuth };
