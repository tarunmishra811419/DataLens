import { Navigate, useLocation } from "react-router-dom";
import { getAuthSession } from "../../services/authService";

/**
 * Route wrapper that ensures only authenticated users can access the route.
 * If not authenticated, redirects to /login and saves current location in state.
 */
export default function ProtectedRoute({ children }) {
    const session = getAuthSession();
    const location = useLocation();

    if (!session || !session.token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
