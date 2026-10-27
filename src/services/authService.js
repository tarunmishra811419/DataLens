// ═══════════════════════════════════════════════
// DataLens - Authentication Service
// Handles user login, registration, password resets,
// and token persistence with backend API & offline fallback.
// ═══════════════════════════════════════════════

import { getApiBaseUrl } from "../utils/constants.js";

const API_BASE_URL = `${getApiBaseUrl()}/api/auth`;

// Render free tier cold-starts can take up to 35 seconds
const REQUEST_TIMEOUT_MS = 35000;

/**
 * Persist authentication session to storage.
 */
export function setAuthSession(user, token, rememberMe = true) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("datalens_user", JSON.stringify(user));
    storage.setItem("datalens_token", token);
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("datalens_auth_changed"));
        window.dispatchEvent(new Event("datalens_stopwatch_updated"));
        window.dispatchEvent(new CustomEvent("datalens_datasets_updated", { detail: { auth: "login" } }));
    }
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
 * Clear authentication session and notify services.
 */
export function clearAuthSession() {
    localStorage.removeItem("datalens_user");
    localStorage.removeItem("datalens_token");
    sessionStorage.removeItem("datalens_user");
    sessionStorage.removeItem("datalens_token");
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("datalens_auth_changed"));
        window.dispatchEvent(new Event("datalens_stopwatch_updated"));
        window.dispatchEvent(new CustomEvent("datalens_datasets_updated", { detail: { auth: "logout" } }));
    }
}

/**
 * Log in a user - Step 1: Validate credentials and send OTP.
 * Returns { pendingOtp: true, email } on success so the UI can show the OTP input.
 * Falls back to demo session if offline (skipping OTP).
 */
export async function loginUser(email, password, rememberMe = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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

        // Server returns pendingOtp: true  →  OTP has been sent
        if (data.pendingOtp) {
            return {
                success: true,
                pendingOtp: true,
                email: data.email,
                message: data.message,
                simulated: data.simulated,
                devOtp: data.devOtp,
            };
        }

        // Fallback: if server returns token directly (shouldn't normally happen)
        const user = { _id: data._id, name: data.name, email: data.email };
        setAuthSession(user, data.token, rememberMe);
        return { success: true, user, token: data.token, isDemo: false };
    } catch (err) {
        clearTimeout(timeoutId);

        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            throw new Error(
                "Unable to reach the server. The backend may be waking up (free tier) — please wait 15 seconds and try again."
            );
        }

        throw err;
    }
}

/**
 * Log in a user - Step 2: Verify OTP and receive token.
 */
export async function loginVerifyOtp(email, otp, rememberMe = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/login-verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to verify code");
        }

        const user = { _id: data._id, name: data.name, email: data.email };
        setAuthSession(user, data.token, rememberMe);
        return { success: true, user, token: data.token };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

/**
 * Resend login OTP code.
 */
export async function resendLoginOtp(email) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/resend-login-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to resend verification code");
        }

        return {
            success: true,
            message: data.message,
            simulated: data.simulated,
            devOtp: data.devOtp,
        };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

/**
 * Send 6-digit OTP code to email for user registration.
 */
export async function sendRegisterOtp(email, name = "") {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, name }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to send verification code");
        }

        return {
            success: true,
            message: data.message,
            simulated: data.simulated,
            devOtp: data.devOtp,
        };
    } catch (err) {
        clearTimeout(timeoutId);

        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            throw new Error(
                "Unable to connect to the email verification server. Please check your connection or try again."
            );
        }

        throw err;
    }
}

/**
 * Verify email OTP and create user account.
 */
export async function registerWithOtp(name, email, password, otp) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/register-with-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, otp }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to verify code and create account");
        }

        const user = { _id: data._id, name: data.name, email: data.email };
        setAuthSession(user, data.token, true);
        return { success: true, user, token: data.token, isDemo: false, message: data.message };
    } catch (err) {
        clearTimeout(timeoutId);

        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            throw new Error(
                "Unable to reach the server to verify code. Please try again."
            );
        }

        throw err;
    }
}

/**
 * Register a new user.
 */
export async function registerUser(name, email, password) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to create account");
        }

        const user = { _id: data._id, name: data.name, email: data.email };
        setAuthSession(user, data.token, true);
        return { success: true, user, token: data.token, isDemo: false };
    } catch (err) {
        clearTimeout(timeoutId);

        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            throw new Error(
                "Unable to reach the server to create account. Please try again."
            );
        }

        throw err;
    }
}

/**
 * Send password reset request.
 */
export async function requestPasswordReset(email) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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

        const isNetworkError =
            err.name === "AbortError" ||
            err.message.includes("Failed to fetch") ||
            err.message.includes("NetworkError");

        if (isNetworkError) {
            throw new Error(
                "Unable to reach the server to send reset email. Please try again."
            );
        }

        throw err;
    }
}

/**
 * Update authenticated user profile details in cloud and local session.
 */
export async function updateUserProfile(profileData) {
    const session = getAuthSession();
    if (!session) throw new Error("Not authenticated");

    const { token, user } = session;

    // If demo token, update local session directly
    if (token.startsWith("demo-")) {
        const updatedUser = { ...user, ...profileData };
        setAuthSession(updatedUser, token);
        return updatedUser;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update profile");
        }

        const updatedUser = { ...user, ...data };
        setAuthSession(updatedUser, token);
        return updatedUser;
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}

/**
 * Update user password with current password verification.
 */
export async function changeUserPassword(currentPassword, newPassword) {
    const session = getAuthSession();
    if (!session) throw new Error("Not authenticated");

    const { token } = session;

    if (token.startsWith("demo-")) {
        return { success: true, message: "Password updated in demo session" };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${API_BASE_URL}/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to update password");
        }

        return { success: true, message: data.message };
    } catch (err) {
        clearTimeout(timeoutId);
        throw err;
    }
}
