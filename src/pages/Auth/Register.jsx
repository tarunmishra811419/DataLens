import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateName, validateEmail, validatePassword } from "../../utils/validators";
import { sendRegisterOtp, registerWithOtp } from "../../services/authService";
import { signInWithGoogle } from "../../services/googleAuthService";
import { Loader2, Mail, ArrowLeft, ShieldCheck, Edit3 } from "lucide-react";
import "./Register.css";

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

function Register() {
    const navigate = useNavigate();

    // Step state: "details" (enter name/email/pass) or "otp" (verify code)
    const [step, setStep] = useState("details");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [otpCode, setOtpCode] = useState("");
    const [resendTimer, setResendTimer] = useState(60);
    const [devHint, setDevHint] = useState(null);

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState(null);

    // Resend countdown timer
    useEffect(() => {
        let interval = null;
        if (step === "otp" && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [step, resendTimer]);

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setServerMessage(null);

        try {
            const result = await signInWithGoogle();
            if (result.success) {
                setServerMessage({
                    type: "success",
                    text: result.notice || "Signed in with Google! Redirecting to dashboard...",
                });
                setTimeout(() => {
                    navigate("/dashboard");
                }, 800);
            }
        } catch (err) {
            setServerMessage({
                type: "error",
                text: err.message || "Google sign-up failed. Please try again.",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (serverMessage) {
            setServerMessage(null);
        }
    };

    // Step 1: Validate inputs and send OTP code to email
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setServerMessage(null);
        setDevHint(null);

        const nameRes = validateName(formData.name);
        const emailRes = validateEmail(formData.email);
        const passRes = validatePassword(formData.password);

        const newErrors = {};
        if (!nameRes.valid) newErrors.name = nameRes.message;
        if (!emailRes.valid) newErrors.email = emailRes.message;
        if (!passRes.valid) newErrors.password = passRes.message;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const res = await sendRegisterOtp(formData.email, formData.name);
            setStep("otp");
            setOtpCode("");
            setResendTimer(60);
            setServerMessage({
                type: "success",
                text: `Verification code sent to ${formData.email}. Please check your inbox.`,
            });
            if (res.devOtp) {
                setDevHint(`Test Mode Code: ${res.devOtp}`);
            }
        } catch (err) {
            setServerMessage({
                type: "error",
                text: err.message || "Failed to send verification code. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Resend OTP code
    const handleResendOtp = async () => {
        if (resendTimer > 0 || isLoading) return;
        setIsLoading(true);
        setServerMessage(null);
        setDevHint(null);

        try {
            const res = await sendRegisterOtp(formData.email, formData.name);
            setResendTimer(60);
            setServerMessage({
                type: "success",
                text: `New verification code sent to ${formData.email}`,
            });
            if (res.devOtp) {
                setDevHint(`Test Mode Code: ${res.devOtp}`);
            }
        } catch (err) {
            setServerMessage({
                type: "error",
                text: err.message || "Failed to resend verification code. Please wait a moment.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP and create user account
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setServerMessage(null);

        const cleanedOtp = otpCode.trim();
        if (!cleanedOtp || cleanedOtp.length < 6) {
            setErrors({ otp: "Please enter the full 6-digit verification code" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await registerWithOtp(
                formData.name,
                formData.email,
                formData.password,
                cleanedOtp
            );

            if (res.success) {
                setServerMessage({
                    type: "success",
                    text: res.notice || "Email verified! Account created. Redirecting to dashboard...",
                });
                setTimeout(() => {
                    navigate("/dashboard");
                }, 800);
            }
        } catch (err) {
            setServerMessage({
                type: "error",
                text: err.message || "Verification failed. Please check the code and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">
                <div className="register-brand">
                    <div className="register-logo">D</div>
                    <span>DataLens</span>
                </div>

                <div className="register-heading">
                    {step === "details" ? (
                        <>
                            <h1>Create your account</h1>
                            <p>Verify your email to start turning data into meaningful insights.</p>
                        </>
                    ) : (
                        <>
                            <h1>Verify your email</h1>
                            <p>Enter the 6-digit code sent to your email to activate your account.</p>
                        </>
                    )}
                </div>

                {serverMessage && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            marginBottom: "16px",
                            background:
                                serverMessage.type === "success"
                                    ? "rgba(16, 185, 129, 0.15)"
                                    : "rgba(239, 68, 68, 0.15)",
                            color:
                                serverMessage.type === "success"
                                    ? "#34d399"
                                    : "#f87171",
                            border: `1px solid ${
                                serverMessage.type === "success"
                                    ? "rgba(16, 185, 129, 0.3)"
                                    : "rgba(239, 68, 68, 0.3)"
                            }`,
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span>{serverMessage.text}</span>
                    </div>
                )}

                {devHint && (
                    <div
                        style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            marginBottom: "14px",
                            background: "rgba(37, 99, 235, 0.12)",
                            color: "#93c5fd",
                            border: "1px dashed rgba(37, 99, 235, 0.4)",
                            fontFamily: "monospace",
                        }}
                    >
                        {devHint}
                    </div>
                )}

                {step === "details" ? (
                    <>
                        {/* Google Sign Up */}
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
                            <span className="auth-divider-text">or register with email</span>
                            <span className="auth-divider-line" />
                        </div>

                        <form className="register-form" onSubmit={handleSendOtp} noValidate>
                            <div className="form-group">
                                <label htmlFor="name">Full name</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                                {errors.name && (
                                    <span style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-email">Email address</label>
                                <input
                                    id="register-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <span style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-password">Password</label>
                                <input
                                    id="register-password"
                                    type="password"
                                    placeholder="Create a password (min. 6 characters)"
                                    value={formData.password}
                                    onChange={(e) => handleChange("password", e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <span style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>
                                        {errors.password}
                                    </span>
                                )}
                            </div>

                            <button
                                className="register-submit"
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    opacity: isLoading ? 0.7 : 1,
                                    cursor: isLoading ? "wait" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px",
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={16} className="spinner-icon" />
                                        <span>Sending Verification Code...</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail size={16} />
                                        <span>Send Verification Code</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    /* Step 2: OTP Verification */
                    <form className="register-form" onSubmit={handleVerifyAndRegister} noValidate>
                        <div className="otp-email-box">
                            <div className="otp-email-content">
                                <span className="otp-email-label">Code sent to:</span>
                                <span className="otp-email-val">{formData.email}</span>
                            </div>
                            <button
                                type="button"
                                className="otp-change-email-btn"
                                onClick={() => {
                                    setStep("details");
                                    setServerMessage(null);
                                    setDevHint(null);
                                }}
                                title="Change email address"
                            >
                                <Edit3 size={13} />
                                <span>Edit</span>
                            </button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="otp-input">6-digit verification code</label>
                            <div className="otp-input-wrap">
                                <input
                                    id="otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otpCode}
                                    onChange={(e) => {
                                        const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
                                        setOtpCode(clean);
                                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }));
                                    }}
                                    disabled={isLoading}
                                    autoFocus
                                    className="otp-digit-input"
                                />
                            </div>
                            {errors.otp && (
                                <span style={{ color: "#f87171", fontSize: "12px", marginTop: "4px" }}>
                                    {errors.otp}
                                </span>
                            )}
                        </div>

                        <div className="otp-resend-row">
                            {resendTimer > 0 ? (
                                <span className="otp-timer-text">
                                    Resend code in <strong>{resendTimer}s</strong>
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="otp-resend-btn"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                >
                                    Resend Verification Code
                                </button>
                            )}
                        </div>

                        <button
                            className="register-submit"
                            type="submit"
                            disabled={isLoading || otpCode.length < 6}
                            style={{
                                opacity: isLoading || otpCode.length < 6 ? 0.7 : 1,
                                cursor: isLoading ? "wait" : otpCode.length < 6 ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyCenter: "center",
                                gap: "8px",
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="spinner-icon" />
                                    <span>Verifying Account...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={16} />
                                    <span>Verify & Create Account</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            className="otp-back-btn"
                            onClick={() => {
                                setStep("details");
                                setServerMessage(null);
                                setDevHint(null);
                            }}
                            disabled={isLoading}
                        >
                            <ArrowLeft size={14} />
                            <span>Back to registration</span>
                        </button>
                    </form>
                )}

                <div className="register-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;