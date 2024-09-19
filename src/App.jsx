import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MainLayout from './components/MainLayout';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Importar el nuevo componente

function App() {
    return (
        <Router>
            <Routes>
                {/* Rutas sin layout, como el login y registro */}
                <Route path="/" element={<LoginRegister />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* Nueva ruta */}

                {/* Rutas con el layout, como la página principal o dashboard */}
                <Route path="/home" element={<MainLayout><HomePage /></MainLayout>} />
            </Routes>
        </Router>
    );
}

export default App;
