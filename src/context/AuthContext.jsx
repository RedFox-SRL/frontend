// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const role = localStorage.getItem("role") || sessionStorage.getItem("role");
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  const login = (token, role, rememberMe) => {
    if (rememberMe) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    } else {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", role);
    }

    setUser({ token, role });

    // Redirigir según el rol
    if (role === "student") {
      navigate("/DashboardStudent");
    } else if (role === "teacher") {
      navigate("/DashboardTeacher");
    } else {
      navigate("/");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
