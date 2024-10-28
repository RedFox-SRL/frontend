// src/routes/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    if (user.role === "student") {
      return <Navigate to="/DashboardStudent" />;
    } else if (user.role === "teacher") {
      return <Navigate to="/DashboardTeacher" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default PublicRoute;
