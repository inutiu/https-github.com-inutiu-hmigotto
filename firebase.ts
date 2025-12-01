import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Helper function to safely get environment variables
const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {}

  return undefined;
};

// Try to construct config
const apiKey = getEnv('REACT_APP_FIREBASE_API_KEY') || getEnv('VITE_FIREBASE_API_KEY');

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN') || getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID') || getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET') || getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID') || getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('REACT_APP_FIREBASE_APP_ID') || getEnv('VITE_FIREBASE_APP_ID')
};

let auth: Auth | null = null;
let db: Firestore | null = null;

// Robust initialization logic
// We check if apiKey is a valid string to avoid crashing with empty/undefined values
if (apiKey && typeof apiKey === 'string' && apiKey.length > 1) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.warn("Firebase initialization failed (Invalid Config). App will run in Demo Mode.", error);
    auth = null;
    db = null;
  }
} else {
  console.warn("Firebase Configuration missing. App running in Demo Mode (Mock Data).");
  auth = null;
  db = null;
}

export { auth, db };