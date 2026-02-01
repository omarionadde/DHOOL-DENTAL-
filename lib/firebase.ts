// Fix: Removing leading empty lines to resolve line number mismatch and ensuring correct modular SDK imports.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAsH4xGoCqZvrANGCRfjF1BntV9Ob5bqAk",
  authDomain: "dhool-6bb8f.firebaseapp.com",
  databaseURL: "https://dhool-6bb8f-default-rtdb.firebaseio.com",
  projectId: "dhool-6bb8f",
  storageBucket: "dhool-6bb8f.firebasestorage.app",
  messagingSenderId: "933427633145",
  appId: "1:933427633145:web:c118266c4df786b46d7b28",
  measurementId: "G-VTEJHTTN13"
};

// Initialize Firebase using the modular SDK pattern
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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