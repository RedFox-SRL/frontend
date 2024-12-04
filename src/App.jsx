import React from "react";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import LoginRegister from "./pages/LoginRegister";
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import {AuthProvider} from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import UnauthorizedPage from "./pages/UnauthorizedPage.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import {Toaster} from "@/components/ui/toaster";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rutas públicas */}
                    <Route
                        path="/"
                        element={
                            <PublicRoute>
                                <LoginPage/>
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <LoginRegister/>
                            </PublicRoute>
                        }
                    />
                    <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
                    <Route
                        path="/DashboardStudent"
                        element={
                            <ProtectedRoute requiredRole="student">
                                <StudentDashboard/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/DashboardTeacher"
                        element={
                            <ProtectedRoute requiredRole="teacher">
                                <TeacherDashboard/>
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/accessDenied" element={<UnauthorizedPage/>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
                <Toaster/>
            </AuthProvider>
        </Router>
    );
}

export default App;
