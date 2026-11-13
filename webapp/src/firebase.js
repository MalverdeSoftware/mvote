import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { USE_MOCK } from './config.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = USE_MOCK ? null : initializeApp(firebaseConfig);

// Auto-detect long-polling instead of the default WebChannel transport —
// WebChannel's persistent streaming connection can be misread as "offline"
// behind school/shared wifi proxies and some sandboxed/restrictive
// browser environments. Auto-detect only falls back to long-polling when
// the streaming transport actually fails, so it doesn't cost anything on
// a normal connection.
export const db = app ? initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}) : null;
