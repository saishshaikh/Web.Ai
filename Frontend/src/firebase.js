// Import Firebase core
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "genwebai-90f30.firebaseapp.com",
  projectId: "genwebai-90f30",
  storageBucket: "genwebai-90f30.firebasestorage.app",
  messagingSenderId: "449930331536",
  appId: "1:449930331536:web:c502bb658a62c45ad4df15",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Google Auth Provider (FIXED)
const provider = new GoogleAuthProvider();

// Export
export { auth, provider };