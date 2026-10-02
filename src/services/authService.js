// ═══════════════════════════════════════════════
// DataLens — Authentication Service
// Handles user login, registration, password resets,
// and token persistence with backend API & offline fallback.
// ═══════════════════════════════════════════════

const API_BASE_URL = "http://localhost:5000/api/auth";

/**
 * Persist authentication session to storage.
 */
export function setAuthSession(user, token, rememberMe = true) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("datalens_user", JSON.stringify(user));
    storage.setItem("datalens_token", token);
}

/**
 * Retrieve current authenticated session.
 */
export function getAuthSession() {
    const localUser = localStorage.getItem("datalens_user");
    const sessionUser = sessionStorage.getItem("datalens_user");
    const localToken = localStorage.getItem("datalens_token");
    const sessionToken = sessionStorage.getItem("datalens_token");

    const userStr = localUser || sessionUser;
    const token = localToken || sessionToken;

    if (!userStr || !token) return null;

    try {
        return {
            user: JSON.parse(userStr),
            token,
        };
    } catch {
        return null;
    }
}

/**
 * Clear authentication session.
 */
export function clearAuthSession() {
    localStorage.removeItem("datalens_user");
    localStorage.removeItem("datalens_token");
    sessionStorage.removeItem("datalens_user");
    sessionStorage.removeItem("datalens_token");
}

/**
 * Log in a user with email and password.
 * Attempts backend connection first, falls back to demo session if offline.
 */
export async function loginUser(email, password, rememberMe = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to log in");
        }

        const user = { _id: data._id, name: data.name, email: data.email };
        setAuthSession(user, data.token, rememberMe);
        return { success: true, user, token: data.token, isDemo: false };
    } catch (err) {
        clearTimeout(timeoutId);

        // If server is offline or network error, provide seamless client/demo session
        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            // Offline demo fallback
            const demoUser = {
                _id: "demo-" + Date.now(),
                name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Data Analyst",
                email: email,
            };
            const demoToken = "demo-jwt-" + Math.random().toString(36).substring(2);
            setAuthSession(demoUser, demoToken, rememberMe);

            return {
                success: true,
                user: demoUser,
                token: demoToken,
                isDemo: true,
                notice: "Signed in with Local Workspace Mode (Backend offline)",
            };
        }

        throw err;
    }
}

/**
 * Send password reset request.
 */
export async function requestPasswordReset(email) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send reset email");
        }

        return { success: true, message: data.message };
    } catch (err) {
        clearTimeout(timeoutId);

        // Offline / simulated success for UX
        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            return {
                success: true,
                simulated: true,
                message: "Password reset link sent (Simulated in offline mode).",
            };
        }

        throw err;
    }
}
