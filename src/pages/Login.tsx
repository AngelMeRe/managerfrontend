import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useLogin } from '../hooks/UseAuth';

export default function Login() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const { mutate, isPending, error } = useLogin();
  const nav = useNavigate();
  const loc = useLocation() as any;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ email, password }, {
      onSuccess: () => {
        const to = loc.state?.from?.pathname ?? '/dashboard';
        nav(to, { replace: true });
      }
    });
  };

  return (
    <div className="login-shell">
      <div className="card login-card">
        <h1 className="login-title">TaskHub</h1>
        <p style={{color:'var(--muted)', marginTop:-6, marginBottom:16}}>Automatización de Tareas</p>
        <form className="login-form" onSubmit={onSubmit}>
          <label>Email</label>
          <input placeholder="admin@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <label>Contraseña</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button disabled={isPending}>{isPending ? 'Ingresando…' : 'Iniciar Sesión'}</button>
          {error && <div className="badge">Error al iniciar sesión</div>}
        </form>
        <div style={{marginTop:16, fontSize:13, color:'var(--muted)'}}>
          Demo: admin/admin123, leader/leader123, collaborator/collab123
        </div>
      </div>
    </div>
  );
}
