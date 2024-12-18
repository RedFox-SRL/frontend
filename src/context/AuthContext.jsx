import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getData} from "../api/apiService";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const role = localStorage.getItem("role") || sessionStorage.getItem("role");

        if (token && role) {
            checkToken().then((isValid) => {
                if (isValid) {
                    setUser({token, role});
                } else {
                    logout();
                }
            });
        }
    }, []);

    const checkToken = async () => {
        try {
            const data = await getData("/check-token");
            return data.valid;
        } catch (error) {
            console.error("Failed to validate token", error);
            logout();
            return false;
        }
    };

    const login = (token, role, rememberMe) => {
        if (rememberMe) {
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
        } else {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("role", role);
        }

        setUser({token, role});

        // Redirect based on role
        if (role === "student") {
            navigate("/dashboardEstudiante");
        } else if (role === "teacher") {
            navigate("/dashboardDocente");
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
        navigate("/");
    };

    return (<AuthContext.Provider value={{user, login, logout}}>
        {children}
    </AuthContext.Provider>);
};

export default AuthContext;