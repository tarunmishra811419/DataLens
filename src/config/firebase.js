// ============================================================
// DataLens - Firebase Configuration
// ============================================================
// HOW TO FILL THIS IN:
//   1. Go to https://console.firebase.google.com
//   2. Click "Add project" -> name it "DataLens" -> Continue
//   3. In the project dashboard, click the </> (Web) icon to add a web app
//   4. Register the app (name it "DataLens Web")
//   5. Copy the firebaseConfig object values below
//   6. Go to Authentication -> Sign-in method -> Enable "Google"
//   7. Add your production domain to "Authorized domains"
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request user's name and email from Google
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Always prompt user to pick a Google account (even if already signed in)
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
