import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

console.log("Initializing Firebase with project:", (firebaseConfig as any).projectId);

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true });
console.log("Firestore initialized with DB id:", app.options.projectId);
export const auth = getAuth(app);
export { firebaseConfig };
