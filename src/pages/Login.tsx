import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useLogin } from '../hooks/UseAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, error } = useLogin();
  const nav = useNavigate();
  const loc = useLocation() as any;

  // Deriva texto de error legible desde el objeto error del hook
  const errText = useMemo(()=>{
    // Intenta leer "message" del backend (axios/fetch)
    const msg = (error as any)?.response?.data?.message
             || (error as any)?.data?.message
             || (error as any)?.message;
    if (!msg) return null;
    // Traducciones/normalización mínimas
    if (/credenciales/i.test(msg)) return 'Credenciales inválidas';
    return String(msg);
  }, [error]);

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
        <div style={{textAlign:'center', marginBottom:12}}>
          <div style={{
            width:64, height:64, borderRadius:14, margin:'0 auto 8px',
            background:'var(--primary)', color:'#042f2e', display:'grid', placeItems:'center', fontWeight:900, fontSize:28
          }}>✓</div>
          <h1 className="login-title" style={{marginBottom:4}}>TaskHub</h1>
          <p style={{color:'var(--muted)', margin:0}}>Gestión de Tareas</p>
        </div>

        <form className="login-form" onSubmit={onSubmit} noValidate>
          {/* Campo Email con label flotante */}
          <div className="field-float">
            <input
              id="email"
              type="email"
              className="input float-input"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              placeholder=" " /* espacio para activar el estado :placeholder-shown */
              autoComplete="username"
              required
            />
            <label htmlFor="email" className="float-label">Correo electrónico</label>
          </div>

          {/* Campo Password con label flotante */}
          <div className="field-float">
            <input
              id="password"
              type="password"
              className="input float-input"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder=" "
              autoComplete="current-password"
              required
            />
            <label htmlFor="password" className="float-label">Contraseña</label>
          </div>

          {/* Error visible con mensaje real */}
          {errText && (
            <div className="alert error" role="alert" aria-live="polite">
              {errText}
            </div>
          )}

          <button disabled={isPending}>
            {isPending ? 'Ingresando…' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Tips o accesos de demo (opcional, responsivo) */}
        <div className="login-hint">
          <div>Usa tus credenciales dadas por el administrador.</div>
        </div>
      </div>
    </div>
  );
}
