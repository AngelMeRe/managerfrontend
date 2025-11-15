import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyTasks, useTasks, useUpdateTask, useDeleteTask, useCreateTask } from '../hooks/useTasks';
import type { TaskStatus } from '../api/tasks';
import { useUsers } from '../hooks/useUsers';

export default function Tasks() {
  const raw = localStorage.getItem('user');
  const me = raw ? JSON.parse(raw) as { role?: 'admin'|'user' } : null;
  const isAdmin = ((me?.role || '') as string).toLowerCase() === 'admin';
  const mine = useMyTasks();
  const all  = useTasks();
  const data = isAdmin ? all.data : mine.data;
  const isLoading = isAdmin ? all.isLoading : mine.isLoading;

  const createM = useCreateTask();
  const updateM = useUpdateTask();
  const deleteM = useDeleteTask();

  const { data: users, isLoading: usersLoading } = useUsers();
  const nav = useNavigate();

  const handleStatusChange = (id:number, value:string) => {
    const allowed = ['Pendiente','En Progreso','Completada'];
    const next = allowed.includes(value) ? value : 'Pendiente';
    updateM.mutate({ id, body: { status: next as TaskStatus } });
  };

  const [filter, setFilter] = useState<'Todas' | TaskStatus>('Todas');
  const [q, setQ] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ title:'', description:'', dueDate:'', assignedToId:'' });

  if (isLoading) return <div className="card">Cargando…</div>;

  const list = data ?? [];
  const filtered = list
    .filter(t => (filter === 'Todas' ? true : t.status === filter))
    .filter(t => t.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 style={{margin:'8px 0 16px', fontSize:32}}>
        {isAdmin ? 'Gestión de Tareas (Global)' : 'Mis Tareas'}
      </h1>

      <div className="toolbar tasks-toolbar">
        <select value={filter} onChange={(e)=>setFilter(e.target.value as any)}>
          <option>Todas</option>
          <option>Pendiente</option>
          <option>En Progreso</option>
          <option>Completada</option>
        </select>
        <input placeholder="Buscar por título…" value={q} onChange={(e)=>setQ(e.target.value)} />
        {isAdmin && (
          <button className="w-auto ml-auto" onClick={()=>setShowNew(true)}>+ Nueva Tarea</button>
        )}
      </div>

      {isAdmin && showNew && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Crear Tarea</h3>

          <div className="new-grid">
            {/* Título */}
            <div>
              <label style={{display:'block', color:'#9ca3af', fontSize:13, marginBottom:6}}>Título</label>
              <input
                className="input"
                placeholder="Título"
                value={draft.title}
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
              />
            </div>

            {/* Asignado a con búsqueda */}
            <div>
              <label style={{display:'block', color:'#9ca3af', fontSize:13, marginBottom:6}}>Asignado a</label>
              <AssignUserPicker
                users={users ?? []}
                loading={usersLoading}
                value={draft.assignedToId}
                onChange={(id:number)=>{
                  setDraft(d=>({ ...d, assignedToId: String(id) }));
                }}
              />
            </div>
          </div>

          {/* Descripción */}
          <div style={{marginTop:8}}>
            <label style={{display:'block', color:'#9ca3af', fontSize:13, marginBottom:6}}>Descripción</label>
            <textarea
              className="input"
              placeholder="Descripción"
              style={{ width: '100%', minHeight: 100 }}
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
            />
          </div>

          {/* Fecha límite + calendario */}
          <div className="toolbar" style={{ marginTop: 8, gap:12, alignItems:'end' }}>
            <div className="field">
              <label style={{display:'block', color:'#9ca3af', fontSize:13, marginBottom:6}}>Fecha Límite</label>
              <div className="date-row">
                <input
                  type="date"
                  className="input"
                  value={draft.dueDate}
                  onChange={e => setDraft(d => ({ ...d, dueDate: e.target.value }))}
                />
                <button
                  type="button"
                  title="Abrir calendario"
                  onClick={(e)=>{
                    const input = (e.currentTarget.previousElementSibling as HTMLInputElement | null);
                    if (input) (input as any).showPicker ? (input as any).showPicker() : input.focus();
                  }}
                >📅</button>
              </div>
            </div>

            <div className="field ml-auto">
              <button onClick={() => {
                createM.mutate({
                  title: draft.title,
                  description: draft.description,
                  dueDate: draft.dueDate,
                  status: 'Pendiente',
                  assignedToId: draft.assignedToId ? Number(draft.assignedToId) : undefined
                } as any, {
                  onSuccess: () => {
                    setShowNew(false);
                    setDraft({ title: '', description: '', dueDate: '', assignedToId: '' });
                  }
                });
              }}>Crear</button>
              <button className="danger" onClick={() => setShowNew(false)} style={{marginLeft:8}}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid tasks-grid">
        {filtered.map(t=>(
          <article key={`task-${t.id}-${t.status}`} className="task-card task-card--accent">
            <h3 className="task-card__title">{t.title}</h3>
            <p className="task-card__desc">{t.description}</p>

            <div className="task-card__assign-row">
              <div className="task-card__assign">
                Asignado: {t.assignedTo?.name ?? '—'}
              </div>
              <span className={
                t.status==='En Progreso' ? 'chip chip--progress' :
                t.status==='Completada'  ? 'chip chip--done'     :
                                            'chip chip--pending'
              }>
                {t.status}
              </span>
            </div>

            <div className="task-card__line">
              <div className="task-card__meta">
                <span role="img" aria-label="calendar">📅</span>
                <span>{new Date(t.dueDate).toLocaleDateString()}</span>
              </div>

              <div className="task-card__actions">
                {!isAdmin && (
                  <>
                    <select
                      className="select"
                      value={t.status}
                      onChange={(e)=>handleStatusChange(t.id, e.target.value)}
                    >
                      <option>Pendiente</option>
                      <option>En Progreso</option>
                      <option>Completada</option>
                    </select>
                    <button className="btn btn-fluid" onClick={()=>nav(`/tareas/${t.id}`)}>
                      Ver / Comentar
                    </button>
                  </>
                )}

                {isAdmin && (
                  <>
                    <button className="btn btn-fluid" onClick={()=>nav(`/tareas/${t.id}`)}>
                      Comentar
                    </button>
                    <button className="btn btn--primary btn-fluid" onClick={()=>nav(`/tareas/${t.id}`)}>
                      Editar
                    </button>
                    <button className="btn btn--danger btn-fluid" onClick={()=>deleteM.mutate(t.id)}>
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}


function AssignUserPicker({
  users, loading, value, onChange
}:{
  users: {id:number; name:string}[];
  loading: boolean;
  value: string | number;
  onChange: (id:number, label?:string)=>void;
}){
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    const onClick = (e:MouseEvent)=>{
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return ()=>window.removeEventListener('click', onClick);
  }, []);

  const current = useMemo(()=>{
    const idNum = Number(value || 0);
    return users.find(u=>u.id === idNum)?.name ?? '';
  }, [users, value]);

  useEffect(()=>{
    if (!open) setQ(current);
  }, [current, open]);

  const list = useMemo(()=>{
    const text = q.trim().toLowerCase();
    if (!text) return users.slice(0, 50);
    return users.filter(u=>u.name.toLowerCase().includes(text)).slice(0, 50);
  }, [users, q]);

  return (
    <div ref={boxRef} style={{position:'relative'}}>
      <input
        className="input"
        placeholder={loading ? 'Cargando usuarios…' : 'Asignado a…'}
        value={q}
        onChange={e=>{ setQ(e.target.value); setOpen(true); }}
        onFocus={()=>setOpen(true)}
        autoComplete="off"
      />
      {open && (
        <div className="card assign-dropdown" style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:20,
          maxHeight:220, overflow:'auto', padding:0
        }}>
          {list.length === 0 ? (
            <div style={{padding:10, color:'var(--muted)'}}>Sin resultados</div>
          ) : (
            list.map(u=>(
              <div
                key={u.id}
                onMouseDown={(e)=>e.preventDefault()}
                onClick={()=>{
                  onChange(u.id, u.name);
                  setQ(u.name);
                  setOpen(false);
                }}
                style={{
                  padding:'10px 12px',
                  cursor:'pointer',
                  background: Number(value||0) === u.id ? 'rgba(52,211,153,0.15)' : 'transparent'
                }}
              >
                {u.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
