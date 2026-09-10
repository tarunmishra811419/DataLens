import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
    return (
        <div className="not-found-page">
            <div className="not-found-card">
                <div className="not-found-logo">D</div>

                <span className="not-found-code">404</span>

                <h1>Page not found</h1>

                <p>
                    The page you're looking for doesn't exist or may have
                    been moved.
                </p>

                <Link to="/" className="not-found-button">
                    ← Back to DataLens
                </Link>
            </div>
        </div>
    );
}

export default NotFound;