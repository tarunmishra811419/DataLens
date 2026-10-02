import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { validateLoginForm } from "../../utils/validators";
import { loginUser } from "../../services/authService";
import "./Login.css";

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
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'error' | 'success' | 'info', text: '' }

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
                        <div className="login-pill">
                            <Sparkles size={13} className="login-pill-icon" />
                            <span>Analytics Studio</span>
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
                            {statusMessage.type === "info" && <Sparkles size={18} className="alert-icon" />}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}

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
                            <Sparkles size={15} />
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