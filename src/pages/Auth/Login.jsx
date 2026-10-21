import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Info
} from "lucide-react";
import { validateLoginForm } from "../../utils/validators";
import { loginUser } from "../../services/authService";
import { signInWithGoogle } from "../../services/googleAuthService";
import "./Login.css";

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
        />
        <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
        />
        <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
        />
        <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
        />
    </svg>
);

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: true,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'error' | 'success' | 'info', text: '' }

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setStatusMessage(null);

        try {
            const result = await signInWithGoogle();
            if (result.success) {
                setStatusMessage({
                    type: "success",
                    text: result.notice || "Signed in with Google! Redirecting to dashboard...",
                });
                setTimeout(() => {
                    navigate("/dashboard");
                }, 900);
            }
        } catch (err) {
            setStatusMessage({
                type: "error",
                text: err.message || "Google sign-in failed. Please try again.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear field error when user types
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (statusMessage) {
            setStatusMessage(null);
        }
    };

    const handleFillDemo = () => {
        setFormData({
            email: "analyst@datalens.io",
            password: "DemoPassword123!",
            rememberMe: true,
        });
        setErrors({});
        setStatusMessage({
            type: "info",
            text: "Demo credentials filled! Click 'Login to DataLens' to continue.",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        // Client-side validation
        const { valid, errors: formErrors } = validateLoginForm({
            email: formData.email,
            password: formData.password,
        });

        if (!valid) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);

        try {
            const result = await loginUser(formData.email, formData.password, formData.rememberMe);

            if (result.success) {
                setStatusMessage({
                    type: "success",
                    text: result.notice || "Welcome back! Redirecting to your dashboard...",
                });

                setTimeout(() => {
                    navigate("/dashboard");
                }, 900);
            }
        } catch (err) {
            setStatusMessage({
                type: "error",
                text: err.message || "Invalid credentials. Please verify and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background ambient lighting */}
            <div className="login-bg-glow glow-top" />
            <div className="login-bg-glow glow-bottom" />

            <div className="login-container">
                {/* Back to Home Link */}
                <Link to="/" className="login-back-link">
                    <ArrowLeft size={16} />
                    <span>Back to Home</span>
                </Link>

                <div className="login-card">
                    {/* Brand Header */}
                    <div className="login-brand-wrapper">
                        <Link to="/" className="login-brand">
                            <div className="login-logo">
                                <span>D</span>
                            </div>
                            <span className="login-brand-text">DataLens</span>
                        </Link>
                        <div className="login-tag">
                            Analytics Studio
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="login-heading">
                        <h1>Welcome back</h1>
                        <p>Sign in to access your datasets, analytics, and AI insights.</p>
                    </div>

                    {/* Notification Banner */}
                    {statusMessage && (
                        <div className={`login-alert alert-${statusMessage.type}`}>
                            {statusMessage.type === "error" && <AlertCircle size={18} className="alert-icon" />}
                            {statusMessage.type === "success" && <CheckCircle2 size={18} className="alert-icon" />}
                            {statusMessage.type === "info" && <Info size={18} className="alert-icon" />}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        type="button"
                        className="google-auth-btn"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isGoogleLoading ? (
                            <Loader2 size={18} className="spinner-icon" />
                        ) : (
                            <GoogleIcon />
                        )}
                        <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                    </button>

                    <div className="auth-divider">
                        <span className="auth-divider-line" />
                        <span className="auth-divider-text">or continue with email</span>
                        <span className="auth-divider-line" />
                    </div>

                    {/* Form */}
                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        {/* Email Input */}
                        <div className={`form-group ${errors.email ? "has-error" : ""}`}>
                            <div className="label-row">
                                <label htmlFor="email">Email address</label>
                            </div>
                            <div className="input-wrapper">
                                <Mail size={18} className="input-icon" />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    placeholder="name@company.com"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        {/* Password Input */}
                        <div className={`form-group ${errors.password ? "has-error" : ""}`}>
                            <div className="label-row">
                                <label htmlFor="password">Password</label>
                                <Link to="/forgot-password" className="forgot-password-link">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="input-wrapper">
                                <Lock size={18} className="input-icon" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>

                        {/* Options row: Remember Me */}
                        <div className="login-options-row">
                            <label className="remember-me-label">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={(e) => handleChange("rememberMe", e.target.checked)}
                                    disabled={isLoading}
                                />
                                <span className="custom-checkbox" />
                                <span>Remember me for 30 days</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="login-submit-btn"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="spinner-icon" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In to DataLens</span>
                                    <ArrowRight size={18} className="btn-arrow" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo One-Click Access */}
                    <div className="demo-access-box">
                        <div className="demo-header">
                            <span className="demo-line" />
                            <span className="demo-title">Quick Demo Access</span>
                            <span className="demo-line" />
                        </div>
                        <button
                            type="button"
                            className="demo-fill-btn"
                            onClick={handleFillDemo}
                            disabled={isLoading}
                        >
                            <span>Prefill Demo Credentials (analyst@datalens.io)</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="login-footer">
                        Don't have an account?{" "}
                        <Link to="/register" className="register-link">
                            Create a free account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;