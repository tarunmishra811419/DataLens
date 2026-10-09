import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateName, validateEmail, validatePassword } from "../../utils/validators";
import { registerUser } from "../../services/authService";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState(null);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
        if (serverMessage) {
            setServerMessage(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMessage(null);

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
            const res = await registerUser(formData.name, formData.email, formData.password);
            if (res.success) {
                setServerMessage({
                    type: "success",
                    text: res.notice || "Account created! Redirecting to dashboard...",
                });
                setTimeout(() => {
                    navigate("/dashboard");
                }, 800);
            }
        } catch (err) {
            setServerMessage({
                type: "error",
                text: err.message || "Failed to create account. Please try again.",
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
                    <h1>Create your account</h1>
                    <p>Start turning your data into meaningful insights.</p>
                </div>

                {serverMessage && (
                    <div
                        style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
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
                        }}
                    >
                        {serverMessage.text}
                    </div>
                )}

                <form className="register-form" onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label htmlFor="name">Full name</label>

                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            disabled={isLoading}
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
                        style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? "wait" : "pointer" }}
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

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