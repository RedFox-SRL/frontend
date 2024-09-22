// src/components/ProtectedRoute.jsx
import useAuth from '../hooks/useAuth'; // Import corregido
import { Navigate } from 'react-router-dom'; // Import desde react-router-dom

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth(); // Asegúrate que este hook está bien importado

  if (!user) {
    // Si no hay usuario autenticado, redirige al login
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Si el usuario no tiene el rol adecuado, redirige a una página de acceso denegado
    return <Navigate to="/access-denied" />;
  }

  // Si está autenticado y tiene el rol adecuado, muestra el contenido de la ruta
  return children;
};

export default ProtectedRoute;
