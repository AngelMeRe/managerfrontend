import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTask, useUpdateTask } from '../hooks/useTasks';
import type { TaskStatus } from '../api/tasks';
import { useUsers } from '../hooks/useUsers';
import CommentThread from '../components/CommentThread';

export default function TaskEdit(){
  const { id } = useParams();
  const taskId = Number(id);
  const { data, isLoading } = useTask(taskId);
  const updateM = useUpdateTask();
  const nav = useNavigate();

  // Rol
  const raw = localStorage.getItem('user');
  const me = raw ? JSON.parse(raw) as { role?: 'admin'|'user' } : null;
  const isAdmin = ((me?.role || '') as string).toLowerCase() === 'admin';

  const { data: users } = useUsers();
  const [form, setForm] = useState({
    title:'', description:'', status:'Pendiente' as TaskStatus, dueDate:'', assignedToId:0
  });

  // Asignado a: buscador
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement|null>(null);

  // Datepicker ref para abrir calendario con botón
  const dateRef = useRef<HTMLInputElement|null>(null);

  useEffect(()=>{ if (data){
    setForm({
      title: data.title,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate.slice(0,10),
      assignedToId: data.assignedToId
    });
    setQ(data.assignedTo?.name ?? '');
  }}, [data]);

  useEffect(()=>{
    const onClick = (e:MouseEvent)=>{
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return ()=>window.removeEventListener('click', onClick);
  }, []);

  const filtered = useMemo(()=>{
    const list = users ?? [];
    const text = q.trim().toLowerCase();
    if (!text) return list.slice(0,50);
    return list.filter(u=>u.name.toLowerCase().includes(text)).slice(0,50);
  }, [users, q]);

  if (isLoading) return <div className="card">Cargando…</div>;

  // Helpers de modo de edición
  const readOnly = !isAdmin;

  return (
    <div className="card">
      {/* Encabezado */}
      <div className="edit-head">
        <h3 className="edit-title">
          {readOnly ? 'Detalle de Tarea' : 'Editar Tarea'}
        </h3>
        <div className="edit-actions">
          <button className="danger btn-fluid" onClick={()=>nav('/tareas')}>
            {readOnly ? 'Volver' : 'Cerrar'}
          </button>
        </div>
      </div>

      {/* Título y Asignado (grid responsive) */}
      <div className="edit-grid">
        <div>
          <label className="label">Título</label>
          <input
            className="input"
            value={form.title}
            onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            placeholder="Título"
            disabled={readOnly}
            readOnly={readOnly}
          />
        </div>

        <div ref={boxRef} className="assign-wrap">
          <label className="label">Asignado a</label>
          <div style={{position:'relative'}}>
            <input
              className="input"
              placeholder="Buscar usuario…"
              value={q}
              onChange={e=>{ if (!readOnly){ setQ(e.target.value); setOpen(true); } }}
              onFocus={()=>{ if (!readOnly) setOpen(true); }}
              autoComplete="off"
              disabled={readOnly}
              readOnly={readOnly}
            />
            {!readOnly && open && (
              <div className="card assign-list">
                {(filtered.length===0) ? (
                  <div style={{padding:10, color:'var(--muted)'}}>Sin resultados</div>
                ) : filtered.map(u=>(
                  <div key={u.id}
                    onMouseDown={e=>e.preventDefault()}
                    onClick={()=>{
                      setForm(f=>({...f, assignedToId:u.id}));
                      setQ(u.name);
                      setOpen(false);
                    }}
                    className={`assign-item ${u.id===form.assignedToId ? 'is-selected' : ''}`}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div style={{marginTop:8}}>
        <label className="label">Descripción</label>
        <textarea
          className="input textarea"
          value={form.description}
          onChange={e=>setForm(f=>({...f,description:e.target.value}))}
          placeholder="Descripción"
          disabled={readOnly}
          readOnly={readOnly}
        />
      </div>

      {/* Estado y Fecha (toolbar responsive) */}
      <div className="toolbar edit-toolbar">
        <div className="field">
          <label className="label">Estado</label>
          <select
            className="select"
            value={form.status}
            onChange={e=>{
              const next = e.target.value as TaskStatus;
              if (readOnly) {
                // Usuario: puede cambiar estado directamente desde aquí
                setForm(f=>({...f, status: next}));
                updateM.mutate({ id: taskId, body: { status: next } });
              } else {
                // Admin: edición normal
                setForm(f=>({...f,status: next}));
              }
            }}
          >
            <option>Pendiente</option>
            <option>En Progreso</option>
            <option>Completada</option>
          </select>
        </div>

        <div className="field">
          <label className="label">Fecha Límite</label>
          <div className="date-row">
            <input
              ref={dateRef}
              className="input"
              type="date"
              value={form.dueDate}
              onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))}
              disabled={readOnly}
              readOnly={readOnly}
            />
            <button
              type="button"
              title="Abrir calendario"
              onClick={()=>{
                if (readOnly) return;
                const input = dateRef.current;
                if (!input) return;
                const anyInput = input as any;
                if (typeof anyInput.showPicker === 'function') anyInput.showPicker();
                else input.focus();
              }}
              disabled={readOnly}
            >📅</button>
          </div>
        </div>

        <div className="field" style={{alignSelf:'end'}}>
          {!readOnly && (
            <button className="btn-fluid" onClick={()=>{
              updateM.mutate({
                id: taskId,
                body: { ...form, dueDate: form.dueDate }
              },{
                onSuccess:()=>nav('/tareas', { replace:true })
              });
            }}>Actualizar Tarea</button>
          )}
          <button className="danger btn-fluid" onClick={()=>nav('/tareas')} style={{marginLeft:8}}>
            {readOnly ? 'Volver' : 'Cancelar'}
          </button>
        </div>
      </div>

      {/* Hilo de comentarios */}
      <CommentThread taskId={taskId} />
    </div>
  );
}
