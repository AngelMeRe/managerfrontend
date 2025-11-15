import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

type Role = 'admin'|'user';
type SessionUser = { id?:number; name?:string; role?: Role } | null;

export default function AppLayout() {
  const nav = useNavigate();
  const [user, setUser] = useState<SessionUser>(null);
  const [open, setOpen] = useState(false); // ← drawer móvil
 
  //lee usuario desde localStorage y normaliza su rol
  const readUser = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw) as SessionUser;
      if (u?.role) u.role = (u.role as string).toLowerCase() as Role;
      return u;
    } catch { return null; }
  };

  useEffect(() => {
    setUser(readUser());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') setUser(readUser());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  //cierre de sesión
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    nav('/login', { replace: true });
  };

  const linkClass = ({ isActive }:{isActive:boolean}) => (isActive ? 'active' : undefined);

  return (
    <div className="app">
      {/* Overlay móvil */}
      <div className={`overlay ${open ? 'show' : ''}`} onClick={()=>setOpen(false)} />

      {/* Sidebar / Drawer */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
          <h2 style={{margin:0, color:'#a7f3d0'}}>TaskHub</h2>
          <button className="icon hide-desktop" onClick={()=>setOpen(false)} aria-label="Cerrar menú">✕</button>
        </div>
        <nav onClick={()=>setOpen(false)}>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/tareas" className={linkClass}>Tareas</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>Panel Admin</NavLink>
          )}
        </nav>
      </aside>

      <main style={{flex:1}}>
        <header className="topbar" style={{background:'#0b1220', borderBottom:'1px solid #1e293b'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <button className="icon hide-desktop" onClick={()=>setOpen(true)} aria-label="Abrir menú">☰</button>
            <div style={{fontWeight:700}}>Bienvenido, {user?.name ?? 'Usuario'}</div>
          </div>
          <div style={{display:'flex', gap:12, alignItems:'center'}}>
            <span className="badge" style={{background:'#0b3b2f', color:'#34d399'}}>
              {user?.role ?? 'user'}
            </span>
            <button onClick={logout} className="danger">Salir</button>
          </div>
        </header>

        <div className="content container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}