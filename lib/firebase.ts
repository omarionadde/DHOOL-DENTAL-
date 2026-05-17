import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase using the modular SDK pattern
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with persistence for "1 second" speeds and offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, // Reliable in sandboxed environments
});

// Initialize Analytics safely
let analytics;
try {
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.warn("Firebase Analytics failed to initialize:", e);
}
export { analytics };
export { firebaseConfig };
