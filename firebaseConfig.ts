
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { getFunctions } from "firebase/functions";

// Configured with your actual Firebase Project keys
const firebaseConfig = {
  apiKey: "AIzaSyDXbipH1eI81O4iW5YPXBCWAZM29IPeDsY",
  authDomain: "studio-4565976316-37893.firebaseapp.com",
  projectId: "studio-4565976316-37893",
  storageBucket: "studio-4565976316-37893.firebasestorage.app",
  messagingSenderId: "485069025590",
  appId: "1:485069025590:web:1243edbb56b640d44e0397"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with standard persistence (localStorage)
export const auth = getAuth(app);

// Initialize Firestore with offline persistence to survive camera reloads
// Using single tab manager to prevent lock hangs in iframes/webviews
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentSingleTabManager({ forceOwnership: false })})
});

export const storage = getStorage(app);
export const functions = getFunctions(app);

// Safe Messaging Initialization (Messaging not supported in all environments/browsers)
let messagingInstance;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messagingInstance = getMessaging(app);
  }
} catch (e) {
  console.warn("Firebase Messaging not supported in this environment", e);
}
export const messaging = messagingInstance;
