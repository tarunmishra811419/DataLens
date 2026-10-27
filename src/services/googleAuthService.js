// ============================================================
// DataLens - Google Authentication Service
// Uses Firebase for the OAuth popup, then exchanges the
// Firebase user info for our own backend JWT.
// ============================================================

import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase.js";
import { setAuthSession } from "./authService.js";
import { getApiBaseUrl } from "../utils/constants.js";

const API_BASE_URL = `${getApiBaseUrl()}/api/auth`;

const REQUEST_TIMEOUT_MS = 35000;

/**
 * Sign in with Google via Firebase popup.
 * On success, registers/finds the user on our backend and
 * stores a DataLens JWT session — identical to email login.
 *
 * @returns {{ success: boolean, user: object, token: string, isDemo: boolean }}
 */
export async function signInWithGoogle() {
    // 1. Verify Firebase configuration
    if (
        !auth ||
        !googleProvider ||
        !import.meta.env.VITE_FIREBASE_API_KEY ||
        import.meta.env.VITE_FIREBASE_API_KEY.includes("your_") ||
        import.meta.env.VITE_FIREBASE_API_KEY.includes("your-")
    ) {
        throw new Error(
            "Google Sign-In is not configured yet. Please add your Firebase environment variables to your deployment settings."
        );
    }

    // 2. Open Google account picker via Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const googlePayload = {
        name:     firebaseUser.displayName || "Google User",
        email:    firebaseUser.email,
        googleId: firebaseUser.uid,
        avatar:   firebaseUser.photoURL || "",
    };

    // 2. Exchange Firebase user info for our backend JWT
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(googlePayload),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Google sign-in failed");
        }

        const user = {
            _id:          data._id,
            name:         data.name,
            email:        data.email,
            role:         data.role,
            bio:          data.bio || "",
            location:     data.location || "",
            avatar:       data.avatar || "",
            authProvider: "google",
        };

        // Store session exactly the same way as email login
        setAuthSession(user, data.token, true);

        return { success: true, user, token: data.token, isDemo: false };

    } catch (err) {
        clearTimeout(timeoutId);

        // Backend offline — create a local-only Google session
        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            const offlineUser = {
                _id:          "google-" + firebaseUser.uid,
                name:         googlePayload.name,
                email:        googlePayload.email,
                role:         "Data Analyst",
                avatar:       googlePayload.avatar,
                authProvider: "google",
            };
            const offlineToken = "demo-google-" + Math.random().toString(36).substring(2);
            setAuthSession(offlineUser, offlineToken, true);

            return {
                success: true,
                user:    offlineUser,
                token:   offlineToken,
                isDemo:  true,
                notice:  "Signed in with Google (Local Workspace Mode - backend offline)",
            };
        }

        // Re-throw real errors (user cancelled, network blocked, etc.)
        throw err;
    }
}

/**
 * Sign out from Firebase (clears Firebase session cookie).
 * Call this alongside clearAuthSession() from authService.
 */
export async function signOutFromGoogle() {
    try {
        if (auth) {
            await firebaseSignOut(auth);
        }
    } catch {
        // Non-critical — local session is cleared by authService regardless
    }
}
