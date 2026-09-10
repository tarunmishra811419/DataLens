import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-brand">
                    <div className="login-logo">D</div>
                    <span>DataLens</span>
                </div>

                <div className="login-heading">
                    <h1>Welcome back</h1>
                    <p>Login to continue analyzing your data.</p>
                </div>

                <form className="login-form">

                    <div className="form-group">
                        <label htmlFor="email">Email address</label>

                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        className="login-submit"
                        type="submit"
                    >
                        Login to DataLens
                    </button>

                </form>

                <Link
                    className="login-forgot"
                    to="/forgot-password"
                >
                    Forgot your password?
                </Link>

                <div className="login-footer">
                    Don't have an account?{" "}
                    <Link to="/register">
                        Create an account
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Login;