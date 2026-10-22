// ============================================================
// DataLens - Firebase Configuration (Resilient Init)
// ============================================================

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

let app = null;
let auth = null;
let googleProvider = null;

// Only initialize if an actual API key is present (prevents crash on Vercel if env vars are unset)
if (
    apiKey &&
    typeof apiKey === "string" &&
    !apiKey.includes("your_") &&
    !apiKey.includes("your-")
) {
    try {
        const firebaseConfig = {
            apiKey:            apiKey,
            authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId:             import.meta.env.VITE_FIREBASE_APP_ID,
        };

        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();

        googleProvider.addScope("profile");
        googleProvider.addScope("email");
        googleProvider.setCustomParameters({ prompt: "select_account" });
    } catch (err) {
        console.warn("[Firebase] Initialization error:", err.message);
    }
}

export { auth, googleProvider };
export default app;
