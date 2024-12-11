import useAuth from "../hooks/useAuth";
import {Navigate} from "react-router-dom";

const ProtectedRoute = ({children, requiredRole}) => {
    const {user} = useAuth();

    if (!user) {
        return <Navigate to="/"/>;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/access-denied"/>;
    }

    return children;
};

export default ProtectedRoute;
