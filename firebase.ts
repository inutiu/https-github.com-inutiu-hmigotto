import { initializeApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Configuration provided directly
const firebaseConfig = {
  apiKey: "AIzaSyB5liiLEyp0-g5eKZQ4TJCfPWP2uckigCQ",
  authDomain: "hmigotto-518d2.firebaseapp.com",
  projectId: "hmigotto-518d2",
  storageBucket: "hmigotto-518d2.firebasestorage.app",
  messagingSenderId: "721479583818",
  appId: "1:721479583818:web:99e52d47ca74fdb8d0beb3"
};

let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully with hardcoded credentials.");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Fallback to null, App.tsx will handle this as "Offline/Demo Mode"
  auth = null;
  db = null;
}

export { auth, db };