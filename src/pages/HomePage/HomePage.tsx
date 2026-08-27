import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

function HomePage() {
    const {
        isAuthenticated,
        isLoading,
    } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to="/workspaces" replace />;
}

export default HomePage;