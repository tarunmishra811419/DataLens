import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
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

                <form className="register-form">

                    <div className="form-group">
                        <label htmlFor="name">Full name</label>

                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-email">Email address</label>

                        <input
                            id="register-email"
                            type="email"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">Password</label>

                        <input
                            id="register-password"
                            type="password"
                            placeholder="Create a password"
                        />
                    </div>

                    <button
                        className="register-submit"
                        type="submit"
                    >
                        Create Account
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