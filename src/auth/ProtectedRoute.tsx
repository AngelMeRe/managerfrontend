import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Protege rutas que requieren estar autenticado
export default function ProtectedRoute() {
  const token = localStorage.getItem('accessToken');
  const loc = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}