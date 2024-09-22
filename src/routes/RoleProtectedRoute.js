// src/routes/RoleProtectedRoute.js
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();  // Obtenemos el usuario desde el contexto de autenticación

  // Si no hay un usuario autenticado o su rol no está en la lista de roles permitidos
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;  // Redirige a una página de acceso no autorizado
  }

  return children;  // Si el rol es permitido, se renderiza la página solicitada
};

export default RoleProtectedRoute;
