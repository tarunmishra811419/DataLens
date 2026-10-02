import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Mail,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    ShieldCheck,
    KeyRound
} from "lucide-react";
import { validateEmail } from "../../utils/validators";
import { requestPasswordReset } from "../../services/authService";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [resendNotification, setResendNotification] = useState("");

    // Handle 60s cooldown timer for resending
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleEmailChange = (val) => {
        setEmail(val);
        if (error) setError("");
        if (resendNotification) setResendNotification("");
    };

    const handleFillDemo = () => {
        setEmail("analyst@datalens.io");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResendNotification("");

        const validation = validateEmail(email);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setIsLoading(true);

        try {
            await requestPasswordReset(email);
            setIsSubmitted(true);
            setCountdown(60);
        } catch (err) {
            setError(err.message || "Failed to send reset link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || isLoading) return;

        setIsLoading(true);
        setResendNotification("");

        try {
            await requestPasswordReset(email);
            setResendNotification("A fresh reset link has been dispatched to your email!");
            setCountdown(60);
        } catch (err) {
            setError(err.message || "Failed to resend reset email.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTryDifferentEmail = () => {
        setIsSubmitted(false);
        setResendNotification("");
        setError("");
        setCountdown(0);
    };

    return (
        <div className="forgot-page">
            {/* Background Ambient Glows */}
            <div className="forgot-bg-glow glow-top" />
            <div className="forgot-bg-glow glow-bottom" />

            <div className="forgot-container">
                {/* Back to Login Link */}
                <Link to="/login" className="forgot-back-link">
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                </Link>

                <div className="forgot-card">
                    {/* Brand Header */}
                    <div className="forgot-brand-wrapper">
                        <Link to="/" className="forgot-brand">
                            <div className="forgot-logo">
                                <span>D</span>
                            </div>
                            <span className="forgot-brand-text">DataLens</span>
                        </Link>
                        <div className="forgot-pill">
                            <KeyRound size={13} className="forgot-pill-icon" />
                            <span>Account Recovery</span>
                        </div>
                    </div>

                    {!isSubmitted ? (
                        <>
                            {/* Heading */}
                            <div className="forgot-heading">
                                <h1>Reset your password</h1>
                                <p>
                                    Enter your registered email address and we'll send you a link to securely reset your password.
                                </p>
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="forgot-alert alert-error">
                                    <AlertCircle size={18} className="alert-icon" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Form */}
                            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
                                <div className={`form-group ${error ? "has-error" : ""}`}>
                                    <label htmlFor="forgot-email">Email address</label>
                                    <div className="input-wrapper">
                                        <Mail size={18} className="input-icon" />
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            placeholder="name@company.com"
                                            disabled={isLoading}
                                            required
                                        />
                                    </div>
                                    {error && <span className="field-error">{error}</span>}
                                </div>

                                <button
                                    className="forgot-submit-btn"
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="spinner-icon" />
                                            <span>Sending link...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <ArrowRight size={18} className="btn-arrow" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Quick fill demo option */}
                            <div className="demo-access-box">
                                <button
                                    type="button"
                                    className="demo-fill-btn"
                                    onClick={handleFillDemo}
                                    disabled={isLoading}
                                >
                                    <span>Prefill Test Email (analyst@datalens.io)</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Success / Link Dispatched State */
                        <div className="forgot-success-state">
                            <div className="success-icon-wrapper">
                                <div className="success-icon-ring" />
                                <CheckCircle2 size={42} className="success-icon" />
                            </div>

                            <div className="forgot-heading center-align">
                                <h1>Check your email</h1>
                                <p>We've sent a password reset link to:</p>
                                <div className="sent-email-badge">
                                    <Mail size={14} />
                                    <span>{email}</span>
                                </div>
                            </div>

                            {resendNotification && (
                                <div className="forgot-alert alert-success">
                                    <CheckCircle2 size={18} className="alert-icon" />
                                    <span>{resendNotification}</span>
                                </div>
                            )}

                            <div className="security-notice">
                                <ShieldCheck size={16} className="notice-icon" />
                                <span>The link is valid for 30 minutes. If you don't see it, check your spam or junk folder.</span>
                            </div>

                            <div className="success-actions">
                                <button
                                    type="button"
                                    className="resend-btn"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="spinner-icon" />
                                            <span>Sending...</span>
                                        </>
                                    ) : countdown > 0 ? (
                                        <>
                                            <RefreshCw size={15} />
                                            <span>Resend in {countdown}s</span>
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={15} />
                                            <span>Resend reset link</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    className="try-different-btn"
                                    onClick={handleTryDifferentEmail}
                                >
                                    Use a different email address
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="forgot-footer">
                        Remember your password?{" "}
                        <Link to="/login" className="login-link">
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;