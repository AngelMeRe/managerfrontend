import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskEdit from './pages/TaskEdit';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import AppLayout from './components/AppLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tareas" element={<Tasks />} />
          <Route path="/tareas/:id" element={<TaskEdit />} />

          {/* Solo admin */}
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}
