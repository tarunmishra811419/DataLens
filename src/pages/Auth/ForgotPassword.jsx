import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
    return (
        <div className="forgot-page">
            <div className="forgot-card">

                <div className="forgot-brand">
                    <div className="forgot-logo">D</div>
                    <span>DataLens</span>
                </div>

                <div className="forgot-heading">
                    <h1>Forgot your password?</h1>
                    <p>
                        Enter your email address and we'll help you
                        get back into your account.
                    </p>
                </div>

                <form className="forgot-form">

                    <div className="form-group">
                        <label htmlFor="forgot-email">
                            Email address
                        </label>

                        <input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                        />
                    </div>

                    <button
                        className="forgot-submit"
                        type="submit"
                    >
                        Send Reset Link
                    </button>

                </form>

                <div className="forgot-footer">
                    Remember your password?{" "}
                    <Link to="/login">
                        Back to Login
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default ForgotPassword;