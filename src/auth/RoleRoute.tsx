import { Navigate, Outlet } from 'react-router-dom';


// Protege rutas por rol: solo 'admin' o solo 'user'
function RoleRoute({ role }:{ role:'admin'|'user' }){
  const raw = localStorage.getItem('user');
  const user = raw ? JSON.parse(raw) as { role?: 'admin'|'user' } : null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
export default RoleRoute;