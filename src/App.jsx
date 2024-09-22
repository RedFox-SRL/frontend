// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import MainLayout from './components/MainLayout';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/DashboardStudent" element={<MainLayout><StudentDashboard /></MainLayout>} />
          <Route path="/DashboardTeacher" element={<MainLayout><TeacherDashboard /></MainLayout>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/home" element={<MainLayout><HomePage /></MainLayout>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;