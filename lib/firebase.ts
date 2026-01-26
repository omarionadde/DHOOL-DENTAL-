
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * FADLAN RAAC TALLAABOOYINKAN:
 * 1. Tag https://console.firebase.google.com/project/dhool-6bb8f/settings/general/
 * 2. Hoos u deji ilaa "Your apps"
 * 3. Copy ka soo dheh "SDK setup and configuration" (ka dooro 'Config')
 * 4. Ku bedel xogta hoose midkaaga rasmiga ah.
 */

const firebaseConfig = {
  // Ku bedel 'AIza...' koodhkaaga saxda ah ee Firebase Console-ka
  apiKey: "YOUR_API_KEY_HERE", 
  authDomain: "dhool-6bb8f.firebaseapp.com",
  projectId: "dhool-6bb8f",
  storageBucket: "dhool-6bb8f.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
