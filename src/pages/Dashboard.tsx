import { useMemo } from 'react';
import { useTasks, useMyTasks } from '../hooks/useTasks';
export default function Dashboard() {
  // Decide fuente según rol guardado en localStorage
  const raw = localStorage.getItem('user');
  const me = raw ? JSON.parse(raw) as { role?: 'admin'|'user' } : null;
  const isAdmin = ((me?.role || '') as string).toLowerCase() === 'admin';

  // Usuarios normales: solo sus tareas; admin: globales
  const mine = useMyTasks();
  const all  = useTasks();

  const data = isAdmin ? (all.data ?? []) : (mine.data ?? []);
  const loading = isAdmin ? all.isLoading : mine.isLoading;

  const { pendientes, progreso, completadas } = useMemo(()=>{
    const pendientes = data.filter(t=>t.status==='Pendiente').length;
    const progreso   = data.filter(t=>t.status==='En Progreso').length;
    const completadas= data.filter(t=>t.status==='Completada').length;
    return { pendientes, progreso, completadas };
  }, [data]);

  if (loading) return <div className="card">Cargando…</div>;

  return (
    <div className="grid" style={{gap:24}}>
      <h1 style={{margin:'8px 0 0', fontSize:32}}>
        {isAdmin ? 'Dashboard Global' : 'Mi Dashboard'}
      </h1>

      <section className="cards">
        <StatCard color="#14b8a6" title="Tareas Pendientes" value={pendientes}/>
        <StatCard color="#22c55e" title="En Progreso" value={progreso}/>
        <StatCard color="#3b82f6" title="Completadas" value={completadas}/>
      </section>

      {/* Sección opcional: reemplaza “Desempeño por Rol” por distribución propia */}
      <section className="grid" style={{gridTemplateColumns:'2fr 1.2fr', gap:24}}>
        <div className="card">
          <h3 style={{marginTop:0}}>Mi progreso</h3>
          <ProgressBar label="Pendiente" value={ratio(pendientes, data.length)}/>
          <ProgressBar label="En Progreso" value={ratio(progreso, data.length)}/>
          <ProgressBar label="Completada" value={ratio(completadas, data.length)}/>
        </div>
        <div className="card">
          <h3 style={{marginTop:0}}>Actividad</h3>
          <ul style={{listStyle:'none', padding:0, margin:0, color:'var(--muted)'}}>
            <li>• Total asignadas: {data.length}</li>
            <li>• Última actualización: {lastDate(data)}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({ color, title, value }:{ color:string; title:string; value:number }) {
  return (
    <div className="card" style={{display:'flex', gap:16, alignItems:'center', padding:20}}>
      <span style={{width:40, height:40, borderRadius:8, background:color, display:'inline-block'}} />
      <div style={{flex:1}}>
        <div style={{color:'#9ca3af', fontSize:14}}>{title}</div>
        <div style={{fontSize:28, fontWeight:800}}>{value}</div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value }:{ label:string; value:number }) {
  return (
    <div style={{margin:'10px 0 14px'}}>
      <div style={{marginBottom:6}}>{label}</div>
      <div style={{height:10, background:'#111827', borderRadius:8}}>
        <div style={{width:`${Math.round(value*100)}%`, height:'100%', background:'#10b981', borderRadius:8}} />
      </div>
    </div>
  );
}

function ratio(part:number, total:number){ return total ? part/total : 0; }
function lastDate(data: { dueDate:string }[]){ 
  if (!data.length) return '—';
  const max = data.map(t=>new Date(t.dueDate).getTime()).reduce((a,b)=>Math.max(a,b), 0);
  return new Date(max).toLocaleDateString();
}
